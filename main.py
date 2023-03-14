import os
import json
import logging
from typing import Any, cast
import yaml
from flask import Flask, Response, make_response, request
from flask import render_template, jsonify
from flask.logging import create_logger
from flask_migrate import Migrate
from models.db import db
from models import Conversation, Message

from lib import openai_tools, type_utils

app = Flask(__name__)
LOGGER = create_logger(app)
root_path = app.root_path


def setup() -> None:
    def database_setup(username: str, password: str, host: str, port: str, database: str) -> None:
        app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{username}:{password}@{host}:{port}/{database}"
        db.init_app(app)

    config = None
    with open(os.path.join(root_path, "config.yaml"), "r", encoding='utf-8') as f:
        config = yaml.safe_load(f)

    openai_tools.setup(config["openai"])
    
    db_config = config["db"]
    database_setup(db_config["username"], db_config["password"],
                   db_config["host"], db_config["port"], db_config["database"])

    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
    http_logger = logging.getLogger("urllib3")
    http_logger.setLevel(logging.DEBUG)
        

setup()
migrate = Migrate(app, db)


@app.route("/")
def hello_world() -> str:
    return "<p>Hello, World!</p>"


@app.route("/hello/<name>")
def hello_to(name : str) -> str:
    return render_template("hello.html", name=name)


@app.route("/openai/console")
def openai_console() -> str:
    conversations: list[Conversation.Conversation] = Conversation.get_conversations(1, 50)
    return render_template("openai_console.html", conversations=conversations)


@app.before_request
def log_request_args() -> None:
    # LOGGER.debug('Headers: %s', request.headers)
    LOGGER.debug('Args: %s', json.dumps(request.args))
    LOGGER.debug('Form: %s', json.dumps(request.form))


@app.post("/openai/api/complete")
def openai_api_complete() -> Response:
    
    model = request.form.get("model")
    prompt = request.form.get("prompt")
    max_tokens = int(request.form.get("max_tokens", ""))
    temperature = float(request.form.get("temperature", ""))
    n = type_utils.safe_int(request.form.get("n", ""), default=1)
    suffix = request.form.get("suffix", None)
    top_p = type_utils.safe_float(request.form.get("top_p", ""), default=1)
    presence_penalty = type_utils.safe_float(request.form.get("presence_penalty", ""), default=0)
    frequency_penalty = type_utils.safe_float(request.form.get("frequency_penalty", ""), default=0)

    
    # Check if the parameters are valid
    errors: list[str] = []
    result: dict[str, Any] = {}
    
    if not model or model not in openai_tools.COMPLETE_MODELS:
        errors.append(f"Invalid parameters: model={model}")
    if not prompt:
        errors.append(f"Invalid parameters: prompt={prompt}")
    if not max_tokens:
        errors.append(f"Invalid parameters: max_tokens={max_tokens}")
    if max_tokens < 1 or max_tokens > 4000:
        errors.append(f"Invalid parameters: max_tokens={max_tokens}, must be between 1 and 2048")
    if temperature < 0 or temperature > 1:
        errors.append(f"Invalid parameters: temperature={temperature}")
    if top_p == 0 or top_p > 1:
        errors.append(f"Invalid parameters: top_p={top_p}")

    if errors:
        LOGGER.error(errors)
    else:
        model = cast(str, model)
        prompt = cast(str, prompt)
        
        result = openai_tools.complete(
            model=model,
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            suffix=suffix,
            top_p=top_p,
            n = n,
            presence_penalty=presence_penalty,
            frequency_penalty=frequency_penalty,)

    http_code = 200 if not errors else 400
    # Return the result and errors as JSON
    return make_response(jsonify(result=result, errors=errors), http_code)


@app.post("/openai/api/edit")
def openai_api_edit() -> Response:
    # Get 'model', 'input', 'instruction', 'n', 'temperature', 'top_p' from request.args
    # Call openai_tools.edit() with the above parameters
    # Pass the result to the template
    model = request.form.get("model")
    input_str = request.form.get("input")
    instruction = request.form.get("instruction")
    n = int(request.form.get("n", ""))
    temperature = float(request.form.get("temperature", ""))
    top_p = float(request.form.get("top_p", ""))

    # Check if the parameters are valid
    errors: list[str] = []
    result: dict[str, Any] = {}
    
    if not model or model not in openai_tools.EDIT_MODELS:
        errors.append(f"Invalid parameters: model={model}")
    if not input_str:
        errors.append(f"Invalid parameters: input={input_str}")
    if not instruction:
        errors.append(f"Invalid parameters: instruction={instruction}")
    if not n or n < 1:
        errors.append(f"Invalid parameters: n={n}")
    if temperature < 0 or temperature > 2:
        errors.append(f"Invalid parameters: temperature={temperature}")
    if top_p == 0 or top_p > 1:
        errors.append(f"Invalid parameters: top_p={top_p}")

    if errors:
        LOGGER.error(errors)
    else:
        model = cast(str, model)
        input_str = cast(str, input_str)
        instruction = cast(str, instruction)
        
        result = openai_tools.edit(
            model=model,
            input_str=input_str,
            instruction=instruction,
            n=n,
            temperature=temperature,
            top_p=top_p,
        )


    http_code = 200 if not errors else 400
    # Return the result and errors as JSON
    return make_response(jsonify(result=result, errors=errors), http_code)


@app.post("/openai/api/chat")
def openai_api_chat() -> Response:
    # Get 'model', 'input', 'instruction', 'n', 'temperature', 'top_p' from request.args
    # Call openai_tools.edit() with the above parameters
    # Pass the result to the template
    model = request.form.get("model")
    messagesJson = request.form.get("messages", "[]")
    max_tokens = int(request.form.get("max_tokens", ""))
    temperature = float(request.form.get("temperature", ""))
    n = type_utils.safe_int(request.form.get("n", ""), default=1)
    top_p = type_utils.safe_float(request.form.get("top_p", ""), default=1)
    presence_penalty = type_utils.safe_float(request.form.get("presence_penalty", ""), default=0)
    frequency_penalty = type_utils.safe_float(request.form.get("frequency_penalty", ""), default=0)

    # Check if the parameters are valid
    errors: list[str] = []
    result: dict[str, Any] = {}
    
    if not model or model not in openai_tools.CHAT_MODELS:
        errors.append(f"Invalid parameters: model={model}")
    if not n or n < 1:
        errors.append(f"Invalid parameters: n={n}")
    if temperature < 0 or temperature > 2:
        errors.append(f"Invalid parameters: temperature={temperature}")
    if top_p == 0 or top_p > 1:
        errors.append(f"Invalid parameters: top_p={top_p}")

    messages = json.loads(messagesJson)

    if not messages:
        errors.append(f"Invalid parameters: messages={messagesJson}")

    if errors:
        LOGGER.error(errors)
    else:
        model = cast(str, model)
        
        result = openai_tools.chat(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            n=n,
            top_p=top_p,
            presence_penalty=presence_penalty,
            frequency_penalty=frequency_penalty,
        )


    http_code = 200 if not errors else 400
    # Return the result and errors as JSON
    return make_response(jsonify(result=result, errors=errors), http_code)
    

@app.get("/conversations")
def get_conversations() -> Response:
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    conversations: list[Conversation.Conversation] = Conversation.get_conversations(page, per_page)
    return make_response(jsonify(conversations=[c.serialized for c in conversations]), 200)

@app.get("/conversations/<conversation_id>")
def get_conversation(conversation_id: str) -> Response:
    # cast conversation_id to int first then call Conversation.get_conversation()
    conversation, messages = Conversation.get_conversation(int(conversation_id))
    return make_response(jsonify(conversation=conversation.serialized,
                                 messages=[m.serialized for m in messages]), 200)

@app.post("/conversations")
def create_conversation() -> Response:
    # get messages, title, brief, is_template from request.form
    # call Conversation.create_conversation() with the above parameters
    messages: list[Any] = json.loads(request.form.get("messages", "[]"))
    # parse messages json
    # title: str = request.form.get("title", "")
    # brief: str = request.form.get("brief", "")
    # copy messages to a new list
    
    title, brief = openai_tools.generate_title_and_brief(messages)
                                              
    is_template: bool = request.form.get("is_template", "false") == "true"
    conversation = Conversation.create_conversation(messages, title, brief, is_template)
    return make_response(jsonify(conversation=conversation.serialized), 200)

@app.put("/conversations/<conversation_id>")
def update_conversation(conversation_id: str) -> Response:
    # get messages, title, brief, is_template from request.form
    # call Conversation.create_conversation() with the above parameters
    messages: list[Any] = json.loads(request.form.get("messages", "[]"))
    # parse messages json
    # title: str = request.form.get("title", "")
    # brief: str = request.form.get("brief", "")

    if len(messages) > 4:
        title, brief = None, None
    else:
        title, brief = openai_tools.generate_title_and_brief(messages)

    is_template: bool = request.form.get("is_template", "false") == "true"
    conversation = Conversation.update_conversation(int(conversation_id), messages, title, brief, is_template)
    return make_response(jsonify(conversation=conversation.serialized), 200)

@app.delete("/conversations/<conversation_id>")
def delete_conversation(conversation_id: str) -> Response:
    # cast conversation_id to int first then call Conversation.delete_conversation()
    Conversation.delete_conversation(int(conversation_id))
    return make_response(jsonify({}), 200)



if __name__ == '__main__':
    app.run(debug=True)
    