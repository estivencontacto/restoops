"""cashier traceability fields

Revision ID: 20260623_0002
Revises: 20260619_0001
Create Date: 2026-06-23
"""

from alembic import op
import sqlalchemy as sa


revision = "20260623_0002"
down_revision = "20260619_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("waiter_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_orders_waiter_id_users", "orders", "users", ["waiter_id"], ["id"])

    op.add_column("payments", sa.Column("waiter_id", sa.Integer(), nullable=True))
    op.add_column("payments", sa.Column("tip_amount", sa.Numeric(10, 2), nullable=False, server_default="0.00"))
    op.add_column("payments", sa.Column("received_amount", sa.Numeric(10, 2), nullable=False, server_default="0.00"))
    op.add_column("payments", sa.Column("change_amount", sa.Numeric(10, 2), nullable=False, server_default="0.00"))
    op.create_foreign_key("fk_payments_waiter_id_users", "payments", "users", ["waiter_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_payments_waiter_id_users", "payments", type_="foreignkey")
    op.drop_column("payments", "change_amount")
    op.drop_column("payments", "received_amount")
    op.drop_column("payments", "tip_amount")
    op.drop_column("payments", "waiter_id")

    op.drop_constraint("fk_orders_waiter_id_users", "orders", type_="foreignkey")
    op.drop_column("orders", "waiter_id")
