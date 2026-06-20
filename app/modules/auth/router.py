from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.modules.auth import service
from app.modules.auth.schemas import Token, UserPublic, UserRegister


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=201)
def register(payload: UserRegister, db: Annotated[Session, Depends(get_db)]):
    return service.register_user(db, payload)


@router.post("/login", response_model=Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    return service.login_user(db, form_data.username, form_data.password)
