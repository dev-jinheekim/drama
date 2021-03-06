/* jshint jquery: true */

$(function () {

  'use strict';

  var IMG_W185 = 'http://image.tmdb.org/t/p/w185/';
  var IMG_ORIGIN = 'http://image.tmdb.org/t/p/original/';
  var season_data = '';
  var total_time = 0;

  // bg change
  function display_bg(bg_path) {
    var bg_img = '#393a35 url(' + IMG_ORIGIN + bg_path + ') no-repeat fixed';
    $('body').css('background', bg_img).css('background-size', '100% auto');
  }

  // search title display
  function display_title(title) {
    $('#search_title').val(title);
  }

  // season selectbox add
  function display_selbox(seasons) {
    var i;
    var selbox = '<li data-season="all">전체시즌</li>';
    for (i = 0; i < seasons; i++) {
      selbox += '<li data-season="' + i + '">시즌 ' + i + '</li>';
    }
    $('.dropdown-menu').empty();
    $('.dropdown-menu').append(selbox);
  }

  function calculator(run_time) {
    var txt;
    var day;
    var hour;
    var minute;
    total_time = total_time + run_time;

    if (total_time >= 60) {
      hour = parseInt(total_time / 60);
      minute = total_time % 60;

      if (hour >= 24) {
        day = parseInt(hour / 24);
        hour = hour % 24;
        txt = day + '일 ' + hour + '시간 ' + minute + '분'; 
      } else {
        txt = hour + '시간 ' + minute + '분';
      }

    } else {
      txt = total_time + '분';
    }

    $('.total_time').text(txt);
  }

  function append_tv(tv) {
    var poster;
    var id = tv.id;
    var title = '<h2 class="media-heading">' + tv.name + '</h2>';
    var summary = '<p>' + tv.overview + '</p>';
    var score = '<span>평점 : ' + tv.vote_average + '</span>';
    if (tv.poster_path) {
      poster = '<div class="thumb-placeholder"><img class="media-object" src="' + IMG_W185 + tv.poster_path + '"></div>';
    } else {
      poster = '<div class="thumb-placeholder"><span>NO<br/>IMG</div>';
    }

    $('.drama_list').append('<li data-id="' + id + '" class="drama_list_item">' +
                            '<div class="media-left">' +
                            poster +
                            '</div><div class="media-body">' +
                            title +
                            summary +
                            score +
                            '</div></li>');  
  }

  function append_tvs(tvs) {
    var i;
    for (i = 0; i < tvs.length; i++) {
      append_tv(tvs[i]);
    }
  }

  function append_season(season, run_time, title_name) {
    var id = season.id; 
    var episode_cnt =  season.episode_count;
    var total_run_time = episode_cnt * run_time;
    var poster;
    var season_num = '<h3> season' + season.season_number + '</h3>';
    var delete_btn = '<input type="button" value="Delete" class="season_del btn btn-primary btn-xs">';

    if (season.poster_path) {
      poster = '<div class="poster-placeholder"><img src="' + IMG_W185 + season.poster_path + '"></div>';
    } else {
      poster = '<div class="poster-placeholder"><span>NO <br/> IMG</span></div>';
    }


    // already exist season item check
    if ($('#' + id).length) {
      var season_number = $('#' + id + '> span').text();
      alert(season_number + '은 이미 추가된 드라마 입니다');
    } else {
      $('.added_drama_list').append('<li id="' + id + '" data-run_time="' + total_run_time + '" class="drama_season_item">' + 
                                    poster + 
                                    '<p>' + title_name + '</p>' + 
                                    '<span>' + season_num + delete_btn + '</span>');
      calculator(total_run_time);
    }
  }

  function append_seasons(season) {
    
    // HACK : movie db api modify request
    var run_time = season_data.episode_run_time[0]; // minute
    var title_name = season_data.original_name;

    if (season === 'all') {
      var i;
      var len;
      for (i = 0, len = season_data.seasons.length; i < len; i++) {
        append_season(season_data.seasons[i], run_time, title_name);
      }  
    } else {
      append_season(season_data.seasons[season], run_time, title_name);
    }
  }
  
  function search_tv(search_title) {
    $.ajax({
      url: '/search',
      method: 'GET',
      data: { search_title: search_title },
      dataType: 'json', // 응답 데이터 타입
      success: function(data) {
        $('.drama_list').empty();
        append_tvs(data.results);
      }
    });
  }

  function search_tv_detail(id) {
    $.ajax({
      url: '/detail',
      method: 'GET',
      data: { id: id },
      dataType: 'json', // 응답 데이터 타입
      success: function(data) {
        season_data = data;
        display_bg(data.backdrop_path);
        display_title(data.original_name);
        display_selbox(data.seasons.length);
      }
    });
  }

  // search tv title
  $('#search_title').on('keydown', function () {
    var search_title = $('#search_title').val();
    search_tv(search_title);
  });

  // search tv select
  $('.drama_list').on('click', '.drama_list_item', function () {
    var id = $(this).data('id');
    $('.drama_list').empty();
    search_tv_detail(id);
  });

  // season item add
  $('body').on('click', '.dropdown-menu > li', function () {
    var season = $(this).data('season');
    append_seasons(season);

  });
 
  // season item delete
  $('.added_drama_list').on('click', '.season_del', function () {
    var run_time = $(this).parent().parent().data('run_time');
    run_time *= -1;
    $(this).parent().parent().remove();
    calculator(run_time);
  });

});

