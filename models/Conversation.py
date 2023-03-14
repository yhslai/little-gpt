from datetime import datetime
from typing import Tuple, Any, Optional
from sqlalchemy import desc
from .db import db
from .Message import Message, create_message


class Conversation(db.Model): # type: ignore
    __tablename__ = 'conversations'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    brief = db.Column(db.Text, nullable=False)
    is_template = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, is_template: bool, title: str, brief: str) -> None:
        self.is_template = is_template
        self.title = title
        self.brief = brief
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        
    def __repr__(self) -> str:
        return f"Conversation {self.id}\n== {self.title} ==\n{self.brief}\n"

    @property
    def serialized(self) -> dict[str, Any]:
        return {
            'id': self.id,
            'title': self.title,
            'brief': self.brief,
            'is_template': self.is_template,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        

def get_conversations(page: int, per_page: int) -> list[Conversation]:
    conversations: list[Conversation] = db.paginate(db.select(Conversation).order_by(desc(Conversation.updated_at)), 
                    page=page, per_page=per_page).items
    return conversations


def get_conversation(conversation_id: int) -> Tuple[Conversation, list[Message]]:
    conversation: Optional[Conversation] = db.session.query(Conversation).where(
        Conversation.id == conversation_id).first()
    messages: list[Message] = db.session.query(Message).where(
        Message.conversation_id == conversation_id).order_by(Message.id).all()
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} does not exist")
    return conversation, messages


def create_conversation(messages: list[Any], title: str, brief: str, is_template: bool = False) -> Conversation:
    conversation: Conversation = Conversation(is_template, title, brief)
    db.session.add(conversation)
    db.session.commit()
    for (i, message) in enumerate(messages):
        print(message)
        create_message(conversation.id, i, message['role'], message['content'])
    return conversation


def update_conversation(conversation_id: int,
                        messages: list[Any], title: Optional[str], brief: Optional[str], is_template: bool = False) -> Conversation:
    # Update an existing conversation in database
    conversation: Optional[Conversation] = db.session.query(Conversation).where(
        Conversation.id == conversation_id).first()
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} does not exist")
    conversation_id = conversation.id
    conversation.title = title if title is not None else conversation.title
    conversation.brief = brief if brief is not None else conversation.brief
    conversation.is_template = is_template
    conversation.updated_at = datetime.now()
    db.session.commit()
    # Delete all messages of the conversation
    db.session.query(Message).where(Message.conversation_id == conversation_id).delete()
    db.session.commit()
    # Create new messages
    for (i, message) in enumerate(messages):
        create_message(conversation_id, i, message['role'], message['content'])
    return conversation

    
def delete_conversation(conversation_id: int) -> None:
    # Delete a conversation and all its messages
    db.session.query(Conversation).where(Conversation.id == conversation_id).delete()
    db.session.commit()
    
    
    
