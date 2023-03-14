## Configuration

    cp config.yaml.example config.yaml

Put your OpenAI API key in `config.yaml`.

## Install Requirements

    pip install -r requirements.txt

## DB Migration

    flask --app main.py db init
    flask --app main.py db migrate
    flask --app main.py db upgrade

## Start App

    flask --app main.py --debug run
