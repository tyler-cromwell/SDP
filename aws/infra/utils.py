import datetime
import json
import yaml
import random
import string


def stack_exists(client, stack_name):
    try:
        client.describe_stacks(StackName=stack_name)
        return True
    except:
        return False


def get_random_name(length=20):
    store = string.ascii_letters + string.digits
    return random.choice(string.ascii_letters) + ''.join([random.choice(store) for i in range(length - 1)])


def read_credentials(filename):
    with open(filename) as fp:
        return tuple(fp.read().splitlines())


def dicts_have_key_with_value(dicts, key, value):
    return any(value in entry[key] for entry in dicts)


def dict_to_yaml(dictionary, filename):
    with open(filename, 'w') as fobject:
        yaml.dump(
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
        indent=2,
        sort_keys=True,
        default=_datetime_handler
    )


def sort_key(dictionary, sortkey):
    return sorted(dictionary, key=lambda k: k[sortkey])
