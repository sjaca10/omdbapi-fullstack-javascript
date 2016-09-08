angular.module('app', ['toaster', 'ngAnimate'])
    .controller('MainController', function MainController($scope, $http, toaster) {
        var main = this;
        var uriMoviesAPI = 'http://www.omdbapi.com/';
        var uriUserAPI = 'http://localhost:3000/api/users/';
        var endpointSignUp = 'sign_up/';
        var endpointSignIn = 'sign_in/';
        var endpointFavourite = 'favourites_movies/';

        $scope.movies = [];
        $scope.favMovies = [];
        $scope.totalMovies = 0;
        $scope.moviesPage = 1;
        $scope.basicSearch = true;
        $scope.advancedSearch = false;
        $scope.search = {
            basic: '',
            id: null,
            title: '',
            year: '',
        }
        $scope.message = "";
        $scope.username = localStorage.getItem('username');

        function changeSearch() {
            $scope.basicSearch = !$scope.basicSearch;
            $scope.advancedSearch  = !$scope.advancedSearch;
        }

        function newSearch(type) {
            $scope.moviesPage = 1;
            $scope.movies = [];
            if(type === 'basic') {
                basicSearchMovie();
            }
            else {
                advancedSearchMovie();
            }
        }

        function basicSearchMovie() {
            $http({
                method: 'GET',
                url: uriMoviesAPI,
                params: {
                    s: $scope.search.basic,
                    page: $scope.moviesPage,
                }
            }).then(function success(response){
                $scope.movies = $scope.movies.concat(response.data.Search);
                $scope.totalMovies = response.data.totalResults;
                $scope.moviesPage += 1;
            }, function error(response){
                toaster.pop('error', 'Error', 'Search error')
            }).then(function() {
                angular.element('#movies-carousel').addClass('carousel slide');
            });
        }

        function advancedSearchMovie() {
            if($scope.search.id != null) {
                advancedSearchMovieById();
            }
            else {
                if($scope.search.title == '') {
                    toaster.pop('error', 'Advanced search', 'Specify title');
                }
                else {
                    advancedSearchMovieByTitleYear()
                }
            }
        }

        function advancedSearchMovieById() {
            $http({
                method: 'GET',
                url: uriMoviesAPI,
                params: {
                    i: $scope.search.id,
                }
            }).then(function success(response){
                $scope.movies = [];
                $scope.movies.push(response.data)
            }, function error(response){
                console.log('error advanced search by id', response);
            }).then(function() {
                angular.element('#movies-carousel').addClass('carousel slide');
            });
        }

        function advancedSearchMovieByTitleYear() {
            $http({
                method: 'GET',
                url: uriMoviesAPI,
                params: {
                    s: $scope.search.title,
                    y: $scope.search.year,
                    page: $scope.moviesPage,
                }
            }).then(function success(response){
                $scope.movies = $scope.movies.concat(response.data.Search);
                $scope.totalMovies = response.data.totalResults;
                $scope.moviesPage += 1;
            }, function error(response){
                console.log('error advanced search by title year', response);
            }).then(function() {
                angular.element('#movies-carousel').addClass('carousel slide');
            });
        }

        function movieFavourite(imdbID) {
            $http({
                method: 'POST',
                url: uriUserAPI + endpointFavourite,
                data: {
                    imdbID: imdbID,
                },
                headers: {
                    Authorization: localStorage.getItem('token'),
                }
            }).then(function success(response) {
                toaster.pop('success', 'Fav movie', response.data.message);
            }, function error(response) {
                toaster.pop('error', 'Fav movie', 'Please sign in');
            });
        }

        function movieNotFavourite(imdbID) {
            $http({
                method: 'DELETE',
                url: uriUserAPI + endpointFavourite + imdbID,
                headers: {
                    Authorization: localStorage.getItem('token')
                }
            }).then(function success(response){
                toaster.pop('success', 'Not fav movie', response.data.message);
                favouriteMovies();
            }, function error(response) {
                toaster.pop('error', 'Not fav movie');
            });
        }

        function favouriteMovies() {
            $http({
                method: 'GET',
                url: uriUserAPI + endpointFavourite,
                headers: {
                    Authorization: localStorage.getItem('token'),
                }
            }).then(function success(response){
                $scope.favMovies = response.data.movies;
                $scope.favMovies.forEach(function(movie, index) {
                    $http({
                        method: 'GET',
                        url: uriMoviesAPI,
                        params: {
                            i: movie,
                        }
                    }).then(function success(response){
                        $scope.favMovies[index] = response.data;
                    }, function error(response){
                        console.log('error advanced search by id', response);
                    });
                });
                angular.element('#modal-favourite-movies').modal('show');
            }, function error(response){
                toaster.pop('error', 'Fav movie');
            });
        }

        function movieChange(index) {
            if($scope.totalMovies > (($scope.moviesPage - 1) * 10)) {
                if($scope.basicSearch) {
                    basicSearchMovie($scope.search);
                }
                else {
                    advancedSearchMovie($scope.search);
                }
            }
        }

        function signUp(user) {
            $http({
                method: 'POST',
                url: uriUserAPI + endpointSignUp,
                data: {
                    username: user.username,
                    password: user.password,
                }
            }).then(function successs(response) {
                if(response.data.success) {
                    $scope.username = user.username;
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('token', response.data.token);
                    toaster.pop('success', 'Sign up', response.data.message);
                    angular.element('#modal-sign-up').modal('hide');
                    user.username = user.password = "";
                }
                else {
                    user.username = user.password = "";
                    toaster.pop('error', 'Sign up', response.data.message);
                }
            }, function error(response){
                toaster.pop('error', 'Error', 'Sign up error')
            });
        }

        function signIn(user) {
            $http({
                method: 'POST',
                url: uriUserAPI + endpointSignIn,
                data: {
                    username: user.username,
                    password: user.password,
                }
            }).then(function successs(response) {
                if(response.data.success) {
                    $scope.username = user.username;
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('token', response.data.token);
                    toaster.pop('success', 'Sign in', response.data.message);
                    angular.element('#modal-sign-in').modal('hide');
                    user.username = user.password = "";
                }
                else {
                    user.password = "";
                    toaster.pop('error', 'Sign in', response.data.message);
                }
            }, function error(response){
                toaster.pop('error', 'Error', 'Sign in not success');
            });
        }

        function signOut() {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            toaster.pop('success', 'Sign out', 'Sign out success. Goodbye!');
        }

        function isAuthenticated() {
            if(localStorage.getItem('token') == null) {
                return false;
            }
            return true;
        }

        $scope.newSearch = newSearch;
        $scope.changeSearch = changeSearch;
        $scope.basicSearchMovie = basicSearchMovie;
        $scope.advancedSearchMovie = advancedSearchMovie;
        $scope.movieFavourite = movieFavourite;
        $scope.movieNotFavourite = movieNotFavourite;
        $scope.movieChange = movieChange;
        $scope.favouriteMovies = favouriteMovies;
        $scope.isAuthenticated = isAuthenticated;
        $scope.signUp = signUp;
        $scope.signIn = signIn;
        $scope.signOut = signOut;
    });
