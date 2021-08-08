# This is a page's title
## This is a page's subtitle

### Plugins

#### after

{% after "2001-01-01 00:00:00" %}
It is the 21st century
{% endafter %}

#### alert

{% alert warning %}
This is an alert
{% endalert %}

#### before

{% before "2001-01-01 00:00:00" %}
It is the 20th century
{% endbefore %}

#### local

{% local "1970-01-01 00:00:00" %}

#### spoiler

{% spoiler "Hint" %}
    42
{% endspoiler %}

#### video

{% video https://www.youtube.com/watch?v=xvFZjo5PgG0 %}

### Syntax

#### Lists

* foo
- bar
    * qux
+ baz
    * quux
