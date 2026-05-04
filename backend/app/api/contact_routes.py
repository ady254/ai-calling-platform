from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import csv
import io

from app.schemas.contact_schema import ContactCreate, ContactUpdate, ContactOut
from app.services.contact_service import (
    create_contact, get_contacts_by_business, get_contact,
    update_contact, delete_contact
)
from app.models.business import Business
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user

router = APIRouter()

async def get_user_business(db: AsyncSession, user_id: str):
    stmt = select(Business).filter(Business.user_id == UUID(user_id))
    result = await db.execute(stmt)
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found for user")
    return business

@router.post("/", response_model=ContactOut)
async def create_contact_route(
    data: ContactCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    if str(data.business_id) != str(business.id):
        raise HTTPException(status_code=403, detail="Not authorized for this business")
    return await create_contact(db, data)

@router.get("/", response_model=list[ContactOut])
async def list_contacts_route(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    return await get_contacts_by_business(db, business.id)

@router.get("/{contact_id}", response_model=ContactOut)
async def get_contact_route(
    contact_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    contact = await get_contact(db, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    if str(contact.business_id) != str(business.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this contact")
    return contact

@router.put("/{contact_id}", response_model=ContactOut)
async def update_contact_route(
    contact_id: UUID,
    data: ContactUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    contact = await get_contact(db, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    if str(contact.business_id) != str(business.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this contact")
    
    return await update_contact(db, contact_id, data)

@router.delete("/{contact_id}")
async def delete_contact_route(
    contact_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    contact = await get_contact(db, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    if str(contact.business_id) != str(business.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this contact")
    
    success = await delete_contact(db, contact_id)
    return {"success": success}

@router.post("/import")
async def import_contacts_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    contents = await file.read()
    try:
        csv_data = contents.decode('utf-8')
        reader = csv.DictReader(io.StringIO(csv_data))
        
        imported_count = 0
        for row in reader:
            # Basic validation
            name = row.get('name', '').strip()
            phone = row.get('phone_number', '').strip()
            
            if name and phone:
                contact_data = ContactCreate(
                    business_id=business.id,
                    name=name,
                    phone_number=phone,
                    email=row.get('email', '').strip() or None,
                    company=row.get('company', '').strip() or None,
                    tags=row.get('tags', '').strip() or None,
                )
                await create_contact(db, contact_data)
                imported_count += 1
                
        return {"success": True, "imported": imported_count}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")