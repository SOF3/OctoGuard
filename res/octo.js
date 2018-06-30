function ctrl(path, params, onComplete) {
    $.post("/token", {
        target: path,
    }, function (result) {
        $.ajax({
            method: "POST",
            url: path,
            headers: {
                "OctoGuard-Ajax-Token": result.Token,
            },
            data: params,
            dataType: "json",
            success: function (data) { return onComplete(data); },
            error: function (jqXHR) {
                alert("Error: " + jqXHR.responseText);
            },
        });
    });
}
