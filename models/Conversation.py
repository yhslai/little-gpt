from datetime import datetime
from typing import Tuple, Any
from .db import db
from .Message import Message, create_message


class Conversation(db.Model): # type: ignore
    __tablename__ = 'conversations'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    brief = db.Column(db.Text, nullable=False)
    is_template = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, is_template: bool, title: str, brief: str) -> None:
        self.is_template = is_template
        self.title = title
        self.brief = brief
        self.created_at = datetime.now()
        
    def __repr__(self) -> str:
        return f"Conversation {self.id}\n== {self.title} ==\n{self.brief}\n"
        

def get_conversations(page: int, per_page: int) -> list[Conversation]:
    conversations: list[Conversation] = db.paginate(db.select(Conversation).order_by(Conversation.id), 
                    page=page, per_page=per_page).items
    return conversations


def get_conversation(conversation_id: int) -> Tuple[Conversation, list[Message]]:
    conversation: Conversation = db.select(Conversation).where(Conversation.id == conversation_id).first()
    messages: list[Message] = db.select(Message).where(
        Message.conversation_id == conversation_id).order_by(Message.id).all()
    return conversation, messages


def create_conversation(messages: list[Any], title: str, brief: str, is_template: bool = False) -> Conversation:
    conversation: Conversation = Conversation(is_template, title, brief)
    db.add(conversation)
    db.commit()
    for (i, message) in enumerate(messages):
        create_message(conversation.id, i, message['role'], message['message'])
    return conversation


def update_conversation(conversation_id: int,
                        messages: list[Any], title: str, brief: str, is_template: bool = False) -> Conversation:
    # Update an existing conversation in database
    conversation: Conversation = db.select(Conversation).where(Conversation.id == conversation_id).first()
    conversation.title = title
    conversation.brief = brief
    conversation.is_template = is_template
    db.commit()
    # Delete all messages of the conversation
    db.delete(db.select(Message).where(Message.conversation_id == conversation_id))
    db.commit()
    # Create new messages
    for (i, message) in enumerate(messages):
        create_message(conversation.id, i, message['role'], message['message'])
    return conversation

    
def delete_conversation(conversation_id: int) -> None:
    # Delete a conversation and all its messages
    db.delete(db.select(Conversation).where(Conversation.id == conversation_id))
    db.delete(db.select(Message).where(Message.conversation_id == conversation_id))
    db.commit()
    
    
    
