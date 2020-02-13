import datetime
import json
import yaml


def dicts_have_key_with_value(dicts, key, value):
    return any(value in entry[key] for entry in dicts)


def dict_to_yaml(dictionary, filename):
    with open(filename, 'w') as fobject:
        yaml.dumps(
            dictionary,
            fobject,
            default_flow_style=False
        )


def prettify_json(string):
    def _datetime_handler(x):
        if isinstance(x, datetime.datetime):
            return x.isoformat()
        raise TypeError("Unknown type")

    return json.dumps(
        string,
        indent=4,
        sort_keys=True,
        default=_datetime_handler
    )


def sort_key(dictionary, sortkey):
    return sorted(dictionary, key=lambda k: k[sortkey])
