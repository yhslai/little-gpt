import os
from typing import Any, Optional
import openai

COMPLETE_MODELS = [
    "text-davinci-003",
]

EDIT_MODELS = [
    "text-davinci-edit-001",
    "code-davinci-edit-001",
]

CHAT_MODELS = [
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0301",
]


def setup(config: dict[str, str]) -> None:
    openai.api_key = config['api_key']


def edit(
    model: str,
    input_str: str,
    instruction: str,
    n: int = 1,
    temperature: float = 1,
    top_p: float = 1,
) -> dict[str, Any]:

    response: dict[str, Any] = openai.Edit.create(
        model=model,
        input=input_str,
        instruction=instruction,
        temperature=temperature,
        top_p=top_p,
        n=n,
    )
    return response


def complete(
    model: str,
    prompt: str,
    max_tokens: int,
    temperature: float,
    suffix: Optional[str] = None,
    top_p: float = 1,
    n: int = 1,
    presence_penalty: float = 0,
    frequency_penalty: float = 0, 
) -> dict[str, Any]:

    response: dict[str, Any] = openai.Completion.create(
        model=model,
        prompt=prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        suffix=suffix,
        top_p=top_p,
        n=n,
        presence_penalty=presence_penalty,
        frequency_penalty=frequency_penalty,
    )
    return response


def chat(
    model: str,
    messages: list[dict[str, str]],
    max_tokens: int,
    temperature: float,
    top_p: float = 1,
    n: int = 1,
    presence_penalty: float = 0,
    frequency_penalty: float = 0, 
) -> dict[str, Any]:

    response: dict[str, Any] = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        n=n,
        presence_penalty=presence_penalty,
        frequency_penalty=frequency_penalty,
    )
    return response
    

def generate_title_and_brief(messages: list[Any]) -> tuple[str, str]:
    messages_copy = messages.copy()
    messages_copy.append({
        "role": "user",
        "content": ("Please summarize our whole conversation to a title (about 8 words)"
                    "and a brief description (about 40 words), "
                    "remember to explain what the subject we're talking about, "
                    "and do NOT start with 'as a...'"
                    "in the following format, without any filler word:\nTitle: (title)\nBrief: (brief)")
    })
    
    result = chat(
            model="gpt-3.5-turbo",
            messages=messages_copy,
            max_tokens=250,
            temperature=0,
            n=1,
            top_p=1,
            presence_penalty=0,
            frequency_penalty=0,
    )

    content = result["choices"][0]["message"]["content"]
    # parse title and brief from content
    title = content.split("Title: ")[1].split("Brief: ")[0].strip()
    brief = content.split("Brief: ")[1].strip()
    
    return title, brief
