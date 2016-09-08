$('#movies-carousel').bind('slide.bs.carousel', function (event) {
    angular.element('#controller').scope().movieChange();
    angular.element('#controller').scope().$apply();
});