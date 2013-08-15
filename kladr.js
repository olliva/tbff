function _IsSafari()
{
        var userAgent = navigator.userAgent.toLowerCase();
        return (/webkit/.test(userAgent));
}
function _EvalGlobal(script)
{
        try {
        if (window.execScript)
                window.execScript(script, 'javascript');
        else if (_IsSafari())
                window.setTimeout(script, 0);
        else
                window.eval(script);
        } catch (e) {/*alert("");*/}
}
function __JCHttpRequest()
{
        this.Action = null;
        this._OnDataReady = function(result)
        {
                if(this.Action)
                        this.Action(result);
        }
        this._CreateHttpObject = function()
        {
                var obj = null;
                if(window.XMLHttpRequest)
                {
                        try {obj = new XMLHttpRequest();} catch(e){}
                }
        else if(window.ActiveXObject)
        {
            try {obj = new ActiveXObject("Microsoft.XMLHTTP");} catch(e){}
            if(!obj)
                    try {obj = new ActiveXObject("Msxml2.XMLHTTP");} catch (e){}
        }
        return obj;
        }
        this._SetHandler = function(httpRequest)
        {
                var _this = this;
                httpRequest.onreadystatechange = function()
                {
                        if(httpRequest.readyState == 4)
                        {
                                {
                                        var s = httpRequest.responseText;
                                        var code = [];
                                        var start, end;
                                        while((start = s.indexOf('<script>')) != -1)
                                        {
                                                var end = s.indexOf('</script>', start);
                                                if(end == -1)
                                                        break;

                                                code[code.length] = s.substr(start+8, end-start-8);
                                                s = s.substr(0, start) + s.substr(end+9);
                                        }
                                        _this._OnDataReady(s);
                                        for(var i = 0, cnt = code.length; i < cnt; i++)
                                                if(code[i] != '')
                                                        _EvalGlobal(code[i]);
                                }
                        }
                }
        }
        this.Send = function(url)
        {
                var httpRequest = this._CreateHttpObject();
                if(httpRequest)
                {
                        httpRequest.open("GET", url, true);
                        this._SetHandler(httpRequest);
                        return httpRequest.send("");
                  }
        }

        this.Post = function(url, data)
        {
                var httpRequest = this._CreateHttpObject();
                if(httpRequest)
                {
                        httpRequest.open("POST", url, true);
                        this._SetHandler(httpRequest);
                        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                        return httpRequest.send(data);
                  }
        }
}
var __CHttpRequest = new __JCHttpRequest();