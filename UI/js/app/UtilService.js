console.log("app", app);

app.factory('UtilService', function ($q, $http) {

    return {
        //  notificationType : 'info', 'success', 'warning', 'danger'
        showNotification: function (msg, duration, notificationType, icon) {

            try {

                duration = undefined == duration ? 1000 : duration;
                notificationType = undefined == notificationType ? 'danger' : notificationType;
                icon = undefined == icon ? "fa fa-exclamation-triangle" : icon;

                $.notify({
                    icon: icon,
                    message: msg

                }, {
                        type: notificationType,
                        timer: duration,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });

            } catch (e) {
                console.log(e);
            }

        },
        makeid: function () {
            var text = "";
            var possible = "0123456789abcdef";

            for (var i = 0; i < 40; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }
    }


});