import asyncio
import base64
import json
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import websockets


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "images"
PROFILE_DIR = ROOT / "docs" / "chrome-profile"
CHROME_PATHS = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
]
BASE_URL = "http://127.0.0.1:8000"


async def send(ws, method, params=None, counter=[0]):
    counter[0] += 1
    message_id = counter[0]
    await ws.send(json.dumps({"id": message_id, "method": method, "params": params or {}}))
    while True:
        payload = json.loads(await ws.recv())
        if payload.get("id") == message_id:
            if "error" in payload:
                raise RuntimeError(payload["error"])
            return payload.get("result", {})


def chrome_path() -> Path:
    for path in CHROME_PATHS:
        if path.exists():
            return path
    raise RuntimeError("No se encontro Chrome o Edge instalado.")


def json_get(url: str):
    with urllib.request.urlopen(url, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


async def wait_for(ws, expression: str, timeout: float = 10) -> None:
    start = time.time()
    while time.time() - start < timeout:
        result = await send(ws, "Runtime.evaluate", {"expression": expression, "returnByValue": True})
        if result.get("result", {}).get("value"):
            return
        await asyncio.sleep(0.25)
    raise TimeoutError(expression)


async def screenshot(ws, name: str) -> None:
    data = await send(ws, "Page.captureScreenshot", {"format": "png", "fromSurface": True})
    (OUT_DIR / name).write_bytes(base64.b64decode(data["data"]))


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if PROFILE_DIR.exists():
        shutil.rmtree(PROFILE_DIR)
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)

    port = 9223
    chrome = subprocess.Popen(
        [
            str(chrome_path()),
            "--headless=new",
            f"--remote-debugging-port={port}",
            f"--user-data-dir={PROFILE_DIR}",
            "--window-size=1440,1100",
            "--hide-scrollbars",
            "--no-first-run",
            "--disable-gpu",
            BASE_URL,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        page = None
        for _ in range(40):
            try:
                pages = json_get(f"http://127.0.0.1:{port}/json")
                page = next((item for item in pages if item.get("type") == "page"), None)
                if page:
                    break
            except Exception:
                await asyncio.sleep(0.25)
        if not page:
            raise RuntimeError("Chrome no expuso una pagina para capturar.")

        async with websockets.connect(page["webSocketDebuggerUrl"], max_size=20_000_000) as ws:
            await send(ws, "Page.enable")
            await send(ws, "Runtime.enable")
            await send(ws, "Page.navigate", {"url": BASE_URL})
            await wait_for(ws, "Boolean(document.querySelector('#loginForm'))")
            await asyncio.sleep(0.8)
            await screenshot(ws, "01-login.png")

            await send(
                ws,
                "Runtime.evaluate",
                {
                    "expression": """
                    (async () => {
                      const form = document.querySelector('#loginForm');
                      form.querySelector('[name=email]').value = 'admin@restoops.co';
                      form.querySelector('[name=password]').value = 'RestoOps2026';
                      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                      return true;
                    })()
                    """,
                    "awaitPromise": True,
                    "returnByValue": True,
                },
            )
            await wait_for(ws, "Boolean(document.querySelector('#appShell:not([hidden]) #viewContainer .stats-grid'))", 15)
            await asyncio.sleep(1)
            await screenshot(ws, "02-dashboard.png")

            for view, filename, selector in [
                ("pos", "03-pos.png", ".pos-layout"),
                ("reservations", "04-reservas.png", "#reservationForm"),
                ("users", "05-usuarios.png", "#userForm"),
            ]:
                await send(ws, "Runtime.evaluate", {"expression": f"setView('{view}'); true;", "returnByValue": True})
                await wait_for(ws, f"Boolean(document.querySelector('{selector}'))", 10)
                await asyncio.sleep(0.6)
                await screenshot(ws, filename)
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=5)
        except subprocess.TimeoutExpired:
            chrome.kill()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as exc:
        print(f"Error generando capturas: {exc}", file=sys.stderr)
        raise
