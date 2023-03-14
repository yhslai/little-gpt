from datetime import datetime
from .db import db


class Message(db.Model): # type: ignore
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    index = db.Column(db.Integer, nullable=False)
    role = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, conversation_id: int, index: int, role: str, message: str) -> None:
        self.conversation_id = conversation_id
        self.index = index
        self.role = role
        self.message = message
        self.created_at = datetime.now()

    def __repr__(self) -> str:
        return (f"Message {self.id} of conversation {self.conversation_id}\n"
                f"{self.role}: {self.message}\n")


def create_message(conversation_id: int, index: int, role: str, msg: str) -> Message:
    # create a message and add it to the database
    message: Message = Message(conversation_id, index, role, msg)
    db.add(message)
    db.commit()
    return message
    