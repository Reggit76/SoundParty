from fastapi import Depends, HTTPException, status
from app.core.security import decode_access_token, oauth2_scheme
from app.repositories.user_repo import get_user_by_username

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    return {"username": username}

def get_current_user_data(token: str = Depends(get_current_user)):
    return token