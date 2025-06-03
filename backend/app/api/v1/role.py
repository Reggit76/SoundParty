from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.role import RoleCreate, RoleResponse, RoleUpdate
from app.utils.db_utils import execute_query

router = APIRouter()

@router.get("/roles", response_model=list[RoleResponse])
def get_all_roles(conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        query = """
        SELECT role_id, role_name
        FROM "Roles"
        ORDER BY role_id
        """
        roles = execute_query(conn, query)
        return roles
    finally:
        put_db(conn)

@router.get("/roles/{role_id}", response_model=RoleResponse)
def get_role_by_id(role_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        query = """
        SELECT role_id, role_name
        FROM "Roles"
        WHERE role_id = %(role_id)s
        """
        result = execute_query(conn, query, {"role_id": role_id})
        if not result:
            raise HTTPException(status_code=404, detail="Role not found")
        return result[0]
    finally:
        put_db(conn)

@router.post("/roles", response_model=RoleResponse)
def create_role(role_data: RoleCreate, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        query = """
        INSERT INTO "Roles" (role_name)
        VALUES (%(role_name)s)
        RETURNING role_id, role_name
        """
        result = execute_query(conn, query, role_data.dict())
        return result[0]
    finally:
        put_db(conn)

@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, role_data: RoleUpdate, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получаем только непустые поля для обновления
        update_fields = {k: v for k, v in role_data.dict().items() if v is not None}
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Строим динамический запрос
        set_clause = ", ".join([f"{field} = %({field})s" for field in update_fields])
        query = f"""
        UPDATE "Roles"
        SET {set_clause}
        WHERE role_id = %(role_id)s
        RETURNING role_id, role_name
        """
        
        params = {**update_fields, "role_id": role_id}
        result = execute_query(conn, query, params)
        
        if not result:
            raise HTTPException(status_code=404, detail="Role not found")
        return result[0]
    finally:
        put_db(conn)

@router.delete("/roles/{role_id}")
def delete_role(role_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        query = """
        DELETE FROM "Roles"
        WHERE role_id = %(role_id)s
        RETURNING role_id
        """
        result = execute_query(conn, query, {"role_id": role_id})
        if not result:
            raise HTTPException(status_code=404, detail="Role not found")
        return {"message": "Role deleted successfully"}
    finally:
        put_db(conn)