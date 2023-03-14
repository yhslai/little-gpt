from typing import Any
from datetime import datetime
from .db import db


class Message(db.Model): # type: ignore
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False)
    index = db.Column(db.Integer, nullable=False)
    role = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, conversation_id: int, index: int, role: str, content: str) -> None:
        self.conversation_id = conversation_id
        self.index = index
        self.role = role
        self.content = content
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def __repr__(self) -> str:
        return (f"Message {self.id} of conversation {self.conversation_id}\n"
                f"{self.role}: {self.content}\n")
    
    @property
    def serialized(self) -> dict[str, Any]:
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'index': self.index,
            'role': self.role,
            'content': self.content,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }


def create_message(conversation_id: int, index: int, role: str, content: str) -> Message:
    # create a message and add it to the database
    message: Message = Message(conversation_id, index, role, content)
    db.session.add(message)
    db.session.commit()
    return message
