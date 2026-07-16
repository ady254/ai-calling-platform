"""
Campaign script templating.

`render_template` merges contact-supplied `custom_fields` into a campaign's AI
prompt. Two properties matter and are easy to regress if someone "upgrades"
this to Jinja2:

1. Contact data must never be executed or recursively expanded — it's untrusted
   input that reaches an LLM prompt.
2. An unknown placeholder must not survive into the text, because the voice
   agent would literally read "{{doctor_name}}" to a patient.
"""

from app.utils.templating import render_template


def test_substitutes_known_variables():
    out = render_template(
        "Hi {{name}}, your appointment with {{doctor_name}} is on {{date}}.",
        {"name": "John", "doctor_name": "Dr. Khalid", "date": "Friday"},
    )
    assert out == "Hi John, your appointment with Dr. Khalid is on Friday."


def test_unknown_placeholder_becomes_empty_never_spoken_aloud():
    out = render_template("Hi {{name}}, see {{doctor_name}}.", {"name": "John"})
    assert out == "Hi John, see ."
    assert "{{" not in out


def test_tolerates_whitespace_inside_placeholder():
    assert render_template("Hi {{ name }}", {"name": "John"}) == "Hi John"


def test_empty_and_none_text():
    assert render_template(None, {"name": "John"}) == ""
    assert render_template("", {"name": "John"}) == ""


def test_values_are_not_recursively_expanded():
    """A contact field containing a placeholder must not be re-rendered.

    Otherwise untrusted contact data could pull in other variables.
    """
    out = render_template("Hi {{name}}", {"name": "{{secret}}", "secret": "leaked"})
    assert out == "Hi {{secret}}"
    assert "leaked" not in out


def test_non_string_values_are_coerced():
    assert render_template("You have {{count}} appointments", {"count": 3}) == "You have 3 appointments"


def test_none_value_renders_empty():
    assert render_template("Hi {{name}}!", {"name": None}) == "Hi !"
