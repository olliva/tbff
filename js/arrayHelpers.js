Array.prototype.customWhere = function(delegate)
{
    var result = [];

    for (var i = 0; i < this.length; i++)
    {
        if (delegate(this[i], i))
        {
            result.push(this[i]);
        }
    }

    return result;
}

Array.prototype.customFirst = function (delegate)
{
    if (arguments.length == 0)
    {
        return this[0];
    }

    for (var i = 0; i < this.length; i++)
    {
        if (delegate(this[i], i))
        {
            return this[i];
        }
    }

    return null;
}

Array.prototype.customIndexOf = function(delegate, notDelegate)
{
    if (typeof (delegate) == "function" && !notDelegate)
    {
        for (var i = 0; i < this.length; i++)
        {
            if (delegate(this[i]))
            {
                return i;
            }
        }
    }
    else
    {
        for (var i = 0; i < this.length; i++)
        {
            if (this[i] == delegate)
            {
                return i;
            }
        }
    }

    return -1;
}

Array.prototype.customForEach = function(delegate)
{
    for (var i = 0; i < this.length; i++)
    {
        delegate(this[i], i, this.length);
    }

    return this;
}