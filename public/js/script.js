var TemplateManager = {
    templates: {}, // holds the templates cache
    get: function(id, callback){
      var template = this.templates[id];
      if (template) { // return the cached version if it exists
        callback(template);
      } else {
        var that = this;
        $.get('/templates/'+ id + ".hbs", function(template) { 
          that.templates[id] = template;
          callback(that.templates[id]);
        });
      }
    }
}
function parseQueryString(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1]);
      }
    }
    
}
var googleCalenderApi = {
  checkAuth:function(callback){

    var CLIENT_ID = '804285538203-qtuefn6mgt4ll3ma358j6qmaos65kq34.apps.googleusercontent.com';
    var SCOPES = ["https://www.googleapis.com/auth/calendar"];
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
    }, callback);
  },
  handleAuthResult : function(authResult) {
    if (authResult && !authResult.error) {
      console.log('success')
      // Hide auth UI, then load client library.
      authorizeDiv.style.display = 'none';
      // this.loadCalendarApi();
    } else {
     console.log('error')
      // Show auth UI, allowing the user to initiate authorization by
      // clicking authorize button.
    
    }
  },
  loadCalendarApi:function () {
    gapi.client.load('calendar', 'v3', listUpcomingEvents);
  },
  listUpcomingEvents:function() {
    var request = gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    });
    request.execute(function(resp) {
      var events = resp.items;
      this.appendPre('Upcoming events:');

      if (events.length > 0) {
        for (i = 0; i < events.length; i++) {
          var event = events[i];
          var when = event.start.dateTime;
          if (!when) {
            when = event.start.date;
          }
          this.appendPre(event.summary + ' (' + when + ')')
        }
      } else {
        this.appendPre('No upcoming events found.');
      }

    }.bind(this));
  },
  appendPre:function(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  },
  setReminders:function(note,callback){
    var event = {
     'summary': note.subject,
     // 'location': '800 Howard St., San Francisco, CA 94103',
     'description': note.subject,
     'start': {
       'dateTime': new Date(note.reminder).toISOString(),
       'timeZone': Intl.DateTimeFormat().resolved.timeZone
     },
     'end': {
       'dateTime': new Date(note.reminder).toISOString(),
       'timeZone': Intl.DateTimeFormat().resolved.timeZone
     },
     'recurrence': [
       'RRULE:FREQ=DAILY;COUNT=2'
     ],
     // 'attendees': [
     //   {'email': 'sunilmore6490@gmail.com'},
     //   {'email': 'sunil@optcentral.com'}
     // ],
     'reminders': {
       'useDefault': false,
       'overrides': [
         {'method': 'email', 'minutes': 24 * 60},
         {'method': 'popup', 'minutes': 10}
       ]
     }
   };

      var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });

      request.execute(function(event) {
        console.log('event',event)
        callback && callback(event)
      })
  }
}
Handlebars.registerHelper('trimString', function(passedString,length) {
    var theString = passedString.substring(0,length);
    return theString;
    // return new Handlebars.SafeString(theString)
});
  Handlebars.registerHelper('getTime', function(date) {
    
    return moment(date).startOf('hour').fromNow();
});
   Handlebars.registerHelper('getLocaleTime', function(date) {
    
    return     new Date(date).toLocaleString('en-US');
});

Handlebars.registerHelper('if_even', function(conditional, options) {
  if((conditional % 2) == 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
Handlebars.registerHelper( "when",function(operand_1, operator, operand_2, options) {
  var operators = {
   'eq': function(l,r) { return l == r; },
   'noteq': function(l,r) { return l != r; },
   'gt': function(l,r) { return Number(l) > Number(r); },
   'or': function(l,r) { return l || r; },
   'and': function(l,r) { return l && r; },
   '%': function(l,r) { return (l % r) === 0; }
  }
  , result = operators[operator](operand_1,operand_2);

  if (result) return options.fn(this);
  else  return options.inverse(this);
});
  
 var NoteModel = Backbone.Model.extend({
  urlRoot: '/api/notes',
  idAttribute : '_id',
  defaults:{
    label:'default'
  }
});
var ShareModel = Backbone.Model.extend({
   urlRoot: '/api/sharenote',
  idAttribute : '_id',
})
var BaseModel = Backbone.Model.extend({

})
var Notes = Backbone.Collection.extend({
    model: NoteModel,
    url:'/api/notes'
});
 var UserModel = Backbone.Model.extend({
  urlRoot: '/api/users',
  idAttribute : '_id',
  defaults:{
      sex:'male'
    }
});
 var ResetPasswordModel = Backbone.Model.extend({
  urlRoot:'/api/resetpassword',
 })


var Users = Backbone.Collection.extend({
    model: NoteModel,
    url:'/api/users',
    
});

var BaseView = Backbone.View.extend({
  destroy_view: function() {

    //COMPLETELY UNBIND THE VIEW
    this.undelegateEvents();

    $(this.el).removeData().unbind(); 

    //Remove view from DOM
    this.remove();  
    Backbone.View.prototype.remove.call(this);

    }
})
var verifyView = BaseView.extend({
  el:'.page',
 
  events :{
    'click .sendconfirmation':'sendConfirmation'
  },
  sendConfirmation:function(){
    console.log('sendConfirmation');
  },
  render:function(status){
    TemplateManager.get('verify_template',function(template){
      var template = Handlebars.compile(template);
      var html = template({status:status});
      this.$el.html(html);
    }.bind(this))
  }
})
var noteView = BaseView.extend({
  el:'#note-modal',
  initialize:function(){
    var screenHeight = window.screen.height;
    this._modelBinder = new Backbone.ModelBinder();
    // _.bindAll(this,'updateUser','render');
    this.labels = [];
    
  },
  events: {
    'click #updateuser' : "updateNote",
    'click .editmode':'showEditForm',
    'click .viewmode':'showViewForm',
    'click .selectsort':'sortByValue'
  },
  render:function(id,type){
   
   this.model = new NoteModel({_id:id})
    if(App.User && App.User._id) this.labels = App.User.labels;
    else this.labels = ['default'];
    var that = this;
    var data = {labels:this.labels,isMobile:App.isMobile,type:id ? 'show':type};
    if(!id){
      TemplateManager.get('note_view_template',function(source){
        var template = Handlebars.compile(source);
        var html = template(_.extend({note:that.model.attributes},data));
        that.$el.html(html);
        that.$('.textarea').wysihtml5({
          toolbar: {
            fa: true
          },html:true
        });
        that.bindModel();
        that.postRender()
        that.$el.find('.viewnote').addClass('hide');
        that.$el.find('.editform').removeClass('hide')
        that.$el.modal('show'); 
      }.bind(this))
      return false;
    }
    //update user
    this.model.fetch({
      success : function(){
       TemplateManager.get('note_view_template',function(source){
        var template = Handlebars.compile(source);
        var html = template(_.extend({note:that.model.attributes},data));
        that.$el.html(html);
        that.$('.textarea').wysihtml5({
        toolbar: {
          fa: true
        },html:true
      });
        that.bindModel();
        that.postRender()
        that.$el.find('.viewnote').removeClass('hide');
        that.$el.find('.editform').addClass('hide')
        if(!that.$el.hasClass('in')) that.$el.modal('show');
       
      }.bind(this))
      }
    })   
  },
  bindModel : function(){
    console.log('this model',this.model)
    //  if(window.App.isMobile){
    //   var toolbarhtml = $('.wysihtml5-toolbar')[0].outerHTML;
    //   this.$el.find('.wysihtml5-toolbar').remove();
    //   this.$el.find('.textnote').prepend(toolbarhtml)
    // }
    this.model.on('change:remindershow',function(){
      var remindershow = this.model.get('remindershow')
      if(remindershow == 'yes'){
        this.$el.find('.remindersection').removeClass('hide')
      }else{
        this.$el.find('.remindersection').addClass('hide')
      }
    }.bind(this))
    this.$('#datetimepicker1').datetimepicker();
    if(this.model.get('reminder')){
      this.model.set('remindershow','yes')
    }else{
      this.model.set('remindershow','no')
    }
   var bindings = {
      subject: '[name=subject]',
      content: '[name=note]',
      label:'[name=notelabel]',
      reminder:'[name=reminder]',
      remindershow :'[name=remindershow]',
      googleCalender:'[name=googleCalender]'
    };
    this._modelBinder.bind(this.model, this.el, bindings);
   
    this.model.on('change:googleCalender',function(){
      var googleCalender = this.model.get('googleCalender');
      if(googleCalender == 'yes'){
       
        window.googleCalenderApi.checkAuth(function(authResult){
           // window.gapi.client.load('calendar', 'v3',);
          if(authResult && !authResult.error){
            window.gapi.client.load('calendar', 'v3',function(test){
              console.log('test',test)
            });
            window.googleAuthSucess = true;
          }
        })
      } 
    }.bind(this))

    $('.selectlabels').selectize({}); 
  },
  showEditForm:function(){
    console.log('calling')
    this.$el.find('.viewnote').addClass('hide');
    this.$el.find('.editform').removeClass('hide')
    return false
  },
  showViewForm:function(){
    this.$el.find('.viewnote').removeClass('hide');
    this.$el.find('.editform').addClass('hide')
    return false;
  },
  updateNote : function(e){

    console.log('reminder',this.model.get('reminder'))
    if(!this.model.get('subject')) return window.App.flash('Please enter subject','error');
    console.log('Calling to updateNote')
    if(this.$('#datetimepicker1').find('input').val()) this.model.set('reminder',this.$('#datetimepicker1').find('input').val())
    var that = this;
    this.model.set('content',window.editor.getValue())
    this.model.save({},{
      success:function(){
        if(window.googleAuthSucess){
          window.googleCalenderApi.setReminders(that.model.attributes,function(event){
            console.log('Event Created',event)
          })
        }
        window.App.flash('success','success');
        // that.$el.modal('hide');
        that.render(that.model.get('_id'),'show')
        // that.$el.find('.viewnote').removeClass('hide');
        // that.$el.find('.editform').addClass('hide')
        App.router.currentView.render();
      }
    })
    return false;
  },
  postRender :function(){
    this.$("input").focus(function() {
     if(window.App.isMobile){
        var $target = $('html,body'); 
        $target.animate({scrollTop: $target.height()}, 400);
     }
   });

    if(this.model.get('reminder')) this.$('#datetimepicker1').find('input').val(this.model.get('reminder'))
    if(window.App.isMobile){
     
      this.$el.find('.wysihtml5-toolbar').css('display','block')
      $('#note-modal').find('.viewnote .modal-content').css('height',window.screen.height)
       // $('#note-modal').find('.editform .modal-content').css('height',window.screen.height)
      $('#note-modal').find('.note-content').css({'height':(window.screen.height-100)+'px','overflow-y':'auto'})
      if($('#note-modal').find('.wysihtml5-toolbar')){
        // $('#note-modal').find('.wysihtml5-toolbar').css({width:'700px','overflow-x':'auto'})
      }
    }
    if(this.model.get('reminder')) this.$('#datetimepicker1').find('input').val(this.model.get('reminder'))
    this.$('img').addClass('img-responsive');
    this.$(".input-4").fileinput({showCaption: false});
    
    var that = this;
    this.$('form[name="note-form"]').submit(function (event) {
      if(that.$(".input-4").val() == ''){ that.updateNote();return false;}
      var filename = $(event.target).find('input[type="file"]').attr('name');
      var formData = new FormData(this);
      $.ajax({
        url: '/api/fileupload?filekey=noteimage',
        type: 'POST',
        data: formData,
        async: false,
        success: function (url) {
          that.model.set('images',[url]);
          that.updateNote();
        },
        error:function(){
          window.App.flash('Something went wrong,Please try again','error')
        },
        cache: false,
        contentType: false,
        processData: false
      });
      return false;
    });
   
  }
}); 
var shareNoteView = BaseView.extend({
  el:'#share-note-modal',
  initialize:function(){
    this._modelBinder = new Backbone.ModelBinder();
    // _.bindAll(this,'updateUser','render');
    this.labels = [];
    
  },
  events: {
    'click #sharenote' : "shareNote",
    'click .openemailarea':'openEmailArea',
    'click .copylink':'copyLinktoClipBoard'
  },
  render:function(note,model){
    this.model = model;
    this.model.set('subject',note.subject)
    var rex = /<img[^>]+src="?([^"\s]+)"?\s*\>/g;
     var m,urls = [];
    // console.log('note content',note.content)
    // console.log('ext',rex.exec( note.content  ))
     while ( m = rex.exec(note.content) ) {
      urls.push( m[1] );
    }
    if(urls.length){
      _.extend(note,{displayImage:urls[0]})
    }
    var data = {isMobile:App.isMobile,User:App.User}
    console.log('model',this.model)
    var sharelink = 'http://'+window.location.host+'/sharenote/'+this.model.get('_id')+'  /n NoteStickShare';
    var that = this;
    this.sharelink = 'http://'+window.location.host+'/sharenote/'+this.model.get('_id')
    TemplateManager.get('share_note_view_template',function(source){
      var template = Handlebars.compile(source);
      var html = template(_.extend(note,data,{sharelink:that.sharelink}));
      that.$el.html(html);
      that.$el.modal('show'); 
    })
    return false;
  },
  bindModel : function(){
   
    // this._modelBinder.bind(this.model, this.el, bindings); 
  },
  shareNote : function(e){
    var emails = this.$el.find('.emails').val();
    if(emails) emails = emails.split(',');
    this.model.set('emails',emails);
    var that = this;
    this.model.save({},{
      success:function(){
        window.App.flash('success','success');
        // that.$el.modal('hide');
        // App.router.currentView.render();
      }
    })
  },
  openEmailArea:function(){
    if(this.$('.email-area').hasClass('hide')){
      this.$('.email-area').removeClass('hide')
    }else{
      this.$('.email-area').addClass('hide')
    }
  },
  copyLinktoClipBoard:function(){
    window.prompt("Copy to clipboard: Ctrl+C, Enter", this.sharelink);
    window.App.flash('Copied To cipoard','success')
  }
}); 
var NavBarView = BaseView.extend({

  el:'nav',
  events:{
    'click #adduser':'addUser',
    'click .signup':'signupModal',
    'click .navbar-toggle':'toggleSidebar',
    'click .logout' :'logOut',
    'click .labelselect:checkbox': 'selectLabel',
    'click .newlabel':'showAddLabel',
    'click .addlabel':'addLabel',
    'click ul a':'closeSidebar',
    'click .togglesearch':'toggleSearch',
    'keyup .search':'searchNotes',
    'click .searchbtn':'searchNotes',

  },
  initialize:function(){
    
    // console.log('vv',new signupView())
    
  },
  searchNotes:function(event){
    var keyword = '';
    var target = $(event.target);
    if(target.hasClass('form-control') && event.keyCode == 13){//text box
      keyword = target.val();

    }else{
      var keyword = $('.search').val();
    }
    // if(keyword.length < 4) return false; 
  
    if(keyword) window.App.keyword = keyword;
    window.App.commonView.notelistView.render()
  },
  toggleSearch:function(event){

    if(this.$('.searchbox').hasClass('hide')){
      this.$('.togglesearch').find('i').removeClass('fa-search');
      this.$('.togglesearch').find('i').addClass('fa-close');
      this.$('.searchbox').removeClass('hide')
    }else{
      this.$('.togglesearch').find('i').addClass('fa-search');
      this.$('.togglesearch').find('i').removeClass('fa-close');
      this.$('.searchbox').addClass('hide');
      if(window.App.keyword != undefined){
        delete window.App.keyword;
        this.$('.search').val('');
        window.App.commonView.notelistView.render();
      } 

    }
  },
  closeSidebar:function(){
    console.log('Calling and')
    this.toggleSidebar()
  },
  addUser:function() {
   App.commonView.noteModalView.render();
    return false;
  },
  signupModal:function(event){
    
    var type = $(event.currentTarget).data('type'); 
    App.signupModal.render(type);
   },
  render:function(){
    this.model = new UserModel(window.App.User || {labels:['default']});
    TemplateManager.get('nav_bar_template',function(source){
      var template = Handlebars.compile(source);
      var html = template(this.model.attributes);
      this.$el.html(html); 
      setTimeout(function(){
        this.postRender()
      }.bind(this),700) 
    }.bind(this))
  },
  toggleSidebar :function(){
    if(!window.sidbarOpened){
      window.sidbarOpened = true;
      $("#mobilenavbar").animate({left: '0px'},700);
    }else{
      window.sidbarOpened = false;
      $("#mobilenavbar").animate({left: '-250px'},700);
    }
  },
  postRender:function(){

    $("#mobilenavbar").swipe({
    swipeStatus:function(event, phase, direction, distance, duration, fingers)
        {
            if (!window.sidbarOpened && (phase=="move" && direction =="right")) {
                window.sidbarOpened = true;
               $("#mobilenavbar").animate({left: '0px'},700);
               return false;
            }
            if (window.sidbarOpened && (phase=="move" && direction =="left")) {
              window.sidbarOpened = false;
              $("#mobilenavbar").animate({left: '-250px'},700);
            }
        }
}); 
  },
  logOut : function(){
    var request = $.post('/api/logout',{});

    request.success(function(result) {
       window.location = '/';
       window.App.flash('Logout Successfully','success')
    });

    request.error(function(jqXHR, textStatus, errorThrown) {
      window.App.error('Something went wrong')
      // Etc
    });
  },
  selectLabel : function(event){
    var $target = $(event.target),
       selected = $target .is(':checked'),
       value = $target.data('value');
    if(!App.selectedlabels) App.selectedlabels = [];
    if(selected){
     if(App.selectedlabels.indexOf(value) < 0) App.selectedlabels.push(value) 
    }else{
       App.selectedlabels.pop(value)
    }
    App.router.currentView.render();

  },
  showAddLabel : function(){
    if(App.User && App.User._id){
      App.commonView.labelView.render();
    }else{
      App.signupModal.render('signup',null,{messagetype:'success',message:'Please Register with us to add Label'})
    }
   
   return false;
  },
  addLabel:function(){
    var that = this;
    if(App.User && App.User._id){
      // this.model = new UserModel(window.App.User);
      var labels = this.model.get('labels');
      labels.push(this.$('.labeltext').val());
      this.model.set('labels',labels);
      this.model.save({},{
        success:function(){
          App.flash('Label Added','success');
          window.App.User = that.model.attributes;
          that.render();
        }})
    }else{
      App.signupModal.render('signup',null,{messagetype:'success',message:'Please Register with us to add Label'})
    }
  }

})
var NoteListView = BaseView.extend({
    el:'.page',
    name:'notelistview',
    events: {
      'click .noteedit' : 'noteEdit',
      'click .deletenote' : 'moveToTrash',
      'click .share':'shareNote',
      'click .filternotes':'showFilterModal',
      'change .selectsort':'sortByData',
      'changed.bs.select .selectpicker':_.debounce(
        function(event){
          this.filterBy(event)
        },800)
    },
    initialize:function(){
      this.collection = new Notes();
    },    
    showFilterModal:function(){
      App.commonView.filterModalView.render();
    },
    sortByData :function(event){
      var keyword = this.$('.selectsort').val()
      window.App.sortBy =  keyword;
      this.sortByText = window.App.sortBy; 
      this.render();
    },
    filterBy:function(event){

      window.App.selectedlabels = $(event.currentTarget).val();
      console.log('selectedlabels',window.App.selectedlabels)
       this.render();
    },
    noteEdit :function (e){
      console.log('useredit',$(e.currentTarget).data('id'))
       var id = $(e.currentTarget).data('id');
      App.commonView.noteModalView.render(id);
      return false;
    },
    moveToTrash : function(e){
      var id = $(e.currentTarget).data('id');
      var $target = $(e.currentTarget)
        , $parent = $target.parents('.note')
        $parent1 = $target.parents('.mobilenote');
      this.note = new BaseModel({});
      this.note.url = '/api/movetotrash/'+id;
      this.note.save({},{
        success:function(){
          window.App.flash('Note moved to trash','success');
          $parent.fadeOut(700,function() {
            $parent.remove();
          });
          if($parent1){
            $parent1.fadeOut(700,function() {
             $parent1.remove();
            });
          }
        }
       })
      return false;
    },
   render:function(){
     $('body').css('background','darkkhaki')
    var param = {status:'active'};
    if(App.selectedlabels){
      param = {label:App.selectedlabels.join(',')}
    }
    if(window.App.keyword){
      param = {keyword:window.App.keyword};
      delete window.App.keyword
    }
    var filtertext = 'Sort by created time'
    if(window.App.sortBy){
      param.sortBy = window.App.sortBy;
      if(param.sortBy == 'modifiedtime'){
         filtertext = 'Sort By Modified time'
      }else if(param.sortBy == 'createdtime'){
        filtertext = 'Sort By Created time'
      }else if(param.sortBy == 'alphabet'){
        filtertext = 'Sort Alphabetically '
      }else if(param.sortBy == 'reminder'){
        filtertext = 'Sort By Reminder'
      }
      delete window.App.sortBy
    }
    var rex = /<img[^>]+src="?([^"\s]+)"?\s*\>/g;

     this.collection.fetch({
        data: $.param(param),
        success:function(){
          TemplateManager.get('note_list_template',function(source){
            var template = Handlebars.compile(source);
            var notes = this.collection.toJSON()
            notes = _.map(notes,function(note){
                 if(note.content ){
                  var m,urls = [];
                  // console.log('note content',note.content)
                  // console.log('ext',rex.exec( note.content  ))
                   while ( m = rex.exec(note.content) ) {
                    urls.push( m[1] );
                  }
                  var todaysDate = new Date();
                  if(note.reminder && new Date(note.reminder).setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
                    note.isTodayReminder = true;
                  }
                  if(urls.length) note.showImage = urls[0];
                 }
                 return note;
            })
            var html = template({sortByText:this.sortByText, filtertext:filtertext,notes:notes,isMobile:App.isMobile,User:window.App.User});
            this.$el.html(html);
           $('.grid').masonry({
              itemSelector: '.grid-item',
              columnWidth: 25,
              gutter: 20,
              transitionDuration: '0.8s',
              stragger:30
           });
           console.log('selectedlabels',window.App.selectedlabels) 
             this.$('.selectpicker').selectpicker({})
           this.$(".selectpicker").selectpicker('val',window.App.selectedlabels)
          }.bind(this)) 
        }.bind(this)
      });
      return this;
    },
    shareNote:function(e){
    var that = this;
    if(App.User && App.User._id){
      var id = $(e.currentTarget).data('id');
      var notes = that.collection.toJSON();
      var note = _.findWhere(notes,{_id:id});
      this.sharenote = new ShareModel({note:note._id});
      this.sharenote.save({},{
        success:function(){
         
          App.commonView.shareNoteModalView.render(note,that.sharenote);
        },
        error:function(){
          App.fash('Something Went Wrong','error')
        }
      })
         
      }else{
        App.signupModal.render('signup',null,{messagetype:'success',message:'Please Register to share this note'})
      }
      return false;
    }
  
  });
var shareNotesView = BaseView.extend({
  el:'.page',
  events:{
   'click .addtomynote':'addToMyNotes'
  },
  initialize:function(){
  },
  addToMyNotes:function(event){
    if(!window.App.User ){
      App.signupModal.render('signup',null,{messagetype:'success',message:'Please Register with use to add this to your notes'})
      // return false;
    }
    var obj = this.model.get('note');
    delete obj._id;
    if(!window.App.User) delete obj.user;
    this.model_obj = new NoteModel(obj);
    this.model_obj.save({},{
      success:function(){
        if(window.App.User) window.App.flash('success','success')
      },
      error:function(){
         if(window.App.User) window.App.flash('Something went wrong','error')
      }
    })
  },
  render:function(shareid){ 
    var that = this;
    this.model = new ShareModel({_id:shareid})
    this.model.fetch({
      success:function(){
        var note = that.model.get('note');
        TemplateManager.get('share_note_template',function(source){
          var template = Handlebars.compile(source);
          var html = template(that.model.attributes);
          that.$el.html(html);
          that.$('img').addClass('img-responsive');
        })
      },
      error:function(){
       that.$el.html('Your link is expired or Wrong');  
      }
    })
  }
})
var signupView = BaseView.extend({
  el:'#signup-modal',
  events:{
    'click .register':'addUser',
    'click .login':'userSession',
    'click .signup':'signupModal',
    'click .forgotpassword':'forgotPassword'
  },
  initialize:function(){
    this._modelBinder = new Backbone.ModelBinder();
    this.model = new UserModel({});
  },
  render:function(type,forgot,messageobj){
    this.type = type;
    TemplateManager.get('signup_template',function(source){
      var template = Handlebars.compile(source);
      if(forgot && $('.resetpassword') && $('.resetpassword').length) forgot = undefined;
      var html = template({type:type,forgot:forgot,messageobj:messageobj});
      this.$el.html(html);
      this.bindModel()
      if(!this.$el.hasClass('in')) this.$el.modal('show');
    }.bind(this))
    return false; 
  },
  signupModal:function(event){
    var type = $(event.currentTarget).data('type');
    console.log('Signup',$(event.currentTarget).data('forgot'))
    var showforgot = $(event.currentTarget).data('forgot');
    this.render(type,showforgot);
   // $('#signup-modal').modal('show')

  },
  bindModel : function(){
   var bindings = {
      email: '[name=email]',
      password: '[name=password]',
    };
    if(this.type == 'signup') _.extend(bindings,{
      firstname:'[name=firstname]',
      lastname:'[name=lastname]'
    })
    this._modelBinder.bind(this.model, this.el, bindings);
  },
  addUser:function(){
    var that = this;
    if(this.model.get('firstname') || this.model.get('lastname')){
      this.model.set('name',{first:this.model.get('firstname')|| '',last:this.model.get('lastname') || ''})
    }
    this.model.save({},{
      success:function(){
        window.App.flash('success','success');
        that.$el.modal('hide');
        sessionStorage.setItem('showWelcomeModal',true);
        window.location = '/';
      },
      error:function(model,respone){
        console.log('respone',respone)
        that.render('signup',false,{messagetype:'error',message:respone.responseJSON.message})
      }
    })
    return false;
  },
  userSession:function(){
    console.log('attributes',this.model.attributes)
    var request = $.post('/api/login', this.model.attributes)
    request.success(function(result) {
       window.App.User = result;
       window.App.flash('Login Successfully','success')       
       window.location = '/'
    });

    request.error(function(jqXHR, textStatus, errorThrown) {
      console.log('dd',jqXHR.responseJSON)
      window.App.flash(jqXHR.responseJSON.message,'error')

      // Etc
    });
    return false;
  },
  forgotPassword :function(){
    var that = this;
    console.log('Calling forgotpassword')
    if(this.$('.forgotmail').val() == '') return that.render('signup','forgot',{messagetype:'error',message:'Please enter your email to reset password'})
    
    this.forgotmodel = new BaseModel({email:this.$('.forgotmail').val()});
    this.forgotmodel.url = '/api/forgotpassword';
    this.forgotmodel.save({},{
      success:function(){
        that.render('signin',null,{messagetype:'success',message:'password reset link has been sent to your email.'})
      },
      error:function(model,respone){
        if(respone.responseJSON.code == 404){
          that.render('signin','forgot',{messagetype:'error',message:respone.responseJSON.message})
        }else{
          window.App.flash('Something went wrong','error')
        }
      }
    })
    return false;

  }
})
var resetPasswordView = BaseView.extend({
  el:'.page',
  name:'resetpasswordview',
  events:{
    'click .resetpassowrd':'resetPassword'
  },
  initialize:function(email,passwordtoken){
    this.model = new ResetPasswordModel({email:email,passwordtoken:passwordtoken});
    this._modelBinder = new Backbone.ModelBinder();
    console.log('this.model reset',this.model)
  },
  render:function(type){
    TemplateManager.get('reset_password_template',function(source){
      var template = Handlebars.compile(source);
      var html = template({user:this.model.attributes,type:type});
      this.$el.html(html);
      this.bindModel()
    }.bind(this))
  },
  resetPassword:function(){
    console.log('Calling to ')
    var that = this;
    if(!this.model.get('password')) return window.App.flash("Please type password",'error')
    if(this.model.get('password') != this.model.get('confirmpassword')){
      window.App.flash("password doesn't match",'error')
      return false;
    }
    this.model.save({},{
      success:function(){
        that.render('message')
      },
      error:function(){
        window.App.flash('Something went wrong','error')
      }
    })
  },
  bindModel:function(){
    var bindings = {
      password: '[name=password]',
      confirmpassword: '[name=confirmpassword]'
    };
    this._modelBinder.bind(this.model, this.el, bindings);
  }
})
var userProfileView = BaseView.extend({
    el:'.page',
    name :'userprofileview',
    events: {
      'click .useredit' : 'userEdit',
      'click .showpassword':'showpassword'
    },
    initialize:function(){
     
      this._modelBinder = new Backbone.ModelBinder();
    },    
    userEdit :function (e){
      this.model.set({name:{first:this.$el.find('[name=namefirst]').val(),last:this.$el.find('[name=namelast]').val()},sex:this.$el.find('input[name=sex]:checked').val(),password:this.$el.find('[name=password]').val()})
      var that = this;
      this.model.save({},{
        success:function(){
          window.App.flash('success','success');
          that.render();
        },
        error:function(){
         window.App.flash('Something Went Wrong','success')
        }
      })
    },
   render:function(){
     this.model = new UserModel(window.App.User);
     // this.model.set({name:this.model.get('name') ? this.model.get('name').first : 'Sunil ',nameLast:this.model.get('name') ? this.model.get('name').last : ' More'})
       if(!this.model.get('name')) this.model.set('name',{});
      TemplateManager.get('user_profile_template',function(source){
        $('body').css({'backround-color':'white'})
        var template = Handlebars.compile(source);
        var html = template(this.model.attributes);
        this.$el.html(html);
        // this.bindModel()
      }.bind(this))   
    },
    bindModel :function(){
      var bindings1 = {
      password: '[name=password]',
       sex :['name=sex'],
      nameFirst : ['#namefirst'],
      nameLast : ['#namelast']
     };

     this._modelBinder.bind(this.model, this.el, bindings1);    
    },
    showpassword:function(){
      if(this.$el.find("[name=password]").attr('type') == 'text'){
        this.$el.find("[name=password]").attr('type','password')
      }else{
        this.$el.find("[name=password]").attr('type','text');
      }
      return false;
    }
  });
 var labelView = BaseView.extend({
   el:'#label-view-modal',
   events:{
    'click .addlabel':'addLabel',
    'click .labeldelete':'deleteLabel'
   },
   initialize:function(){

   },
   render:function(){
    this.model = new UserModel(window.App.User);
    TemplateManager.get('label_list_template',function(source){
      var template = Handlebars.compile(source);
      var html = template(window.App.User);
      this.$el.html(html); 
      this.$el.modal('show')
    }.bind(this))
   },
   addLabel:function(){
      var label = this.$('.labeltext').val();
      if(!label) return window.App.flash('Please ener label','error')
      var that = this;
      if(App.User && App.User._id){
        // this.model = new UserModel(window.App.User);
        var labels = this.model.get('labels');
        if(labels.indexOf(label.toLowerCase()) > -1){
            window.App.flash('Label already exist','error')
          return ;
        }
        labels.push(label.toLowerCase());
        this.model.set('labels',labels);
        this.model.save({},{
          success:function(){
            App.flash('Label Added','success');
            window.App.User = that.model.attributes;
            that.render();
          }})
      }
   },
   deleteLabel:function(event){
      var label = $(event.currentTarget).data('id');
      var that = this;
      console.log('abec',label)
      if(App.User && App.User._id){
        // this.model = new UserModel(window.App.User);
        var labels = this.model.get('labels');
        labels.splice(labels.indexOf(label),1);
        this.model.set('labels',labels);
        this.model.save({},{
          success:function(){
            App.flash('Label Added','success');
            window.App.User = that.model.attributes;
            that.render();
          }})
      }
   }
 })
 var filterModalView = BaseView.extend({
   el:'#filter-modal',
   events:{
    'click .sortby':'sortBy'
   },
   initialize:function(){

   },
   sortBy:function(event){
    var key = $(event.target).data('key');
    console.log('key',key)
    window.App.sortBy = key;
    window.App.commonView.notelistView.render();
    this.$el.modal('hide')
    return false;
   },
   render:function(){
    this.model = new UserModel(window.App.User);
    TemplateManager.get('filter_template',function(source){
      var template = Handlebars.compile(source);
      var html = template(window.App.User);
      this.$el.html(html); 
      this.$el.modal('show')
    }.bind(this))
   }
 })
 var contactView = BaseView.extend({
   events:{

   },
   el:'.page',
   initialize:function(){

   },
   render:function(){
    TemplateManager.get('contact_template',function(source){
      var template = Handlebars.compile(source);
      var html = template({});
      this.$el.html(html);
      this.googleMap();
    }.bind(this))
   },
   googleMap:function(){
      var myLocation = new google.maps.LatLng(18.56391, 73.81277);
      var mapOptions = {
          center: myLocation,
          zoom: 16
      };
      var marker = new google.maps.Marker({
          position: myLocation,
          title: "Property Location"
      });
      var map = new google.maps.Map(document.getElementById("map1"),
          mapOptions);
      marker.setMap(map);
    }
 })
  var reminderView = BaseView.extend({
   events:{

   },
   el:'.page',
   initialize:function(){
    this.collection = new Notes();
   },
   render:function(){
    var param = {isreminder:true,reminder:'new',status:'active'};
    
    var rex = /<img[^>]+src="?([^"\s]+)"?\s*\>/g;

     this.collection.fetch({
        data: $.param(param),
        success:function(){
          TemplateManager.get('reminders_template',function(source){
            var template = Handlebars.compile(source);
            var notes = this.collection.toJSON();
            notes = _.map(notes,function(note){
              var todaysDate = new Date();
              if(new Date(note.reminder).setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
                note.isTodayReminder = true;
              }
              return note;
            })
            this.previouscollection = new Notes()
            this.previouscollection.fetch({
              data:$.param(_.extend(param,{reminder:'old'})),
              success:function(){
                var previousnotes = this.previouscollection.toJSON();
                var html = template({notes:notes,isMobile:App.isMobile,User:window.App.User,previousnotes:previousnotes});
                this.$el.html(html);  
              }.bind(this)
            })
      
           
          }.bind(this)) 
        }.bind(this)
      });
   
   },
   googleMap:function(){
      var myLocation = new google.maps.LatLng(18.56391, 73.81277);
      var mapOptions = {
          center: myLocation,
          zoom: 16
      };
      var marker = new google.maps.Marker({
          position: myLocation,
          title: "Property Location"
      });
      var map = new google.maps.Map(document.getElementById("map1"),
          mapOptions);
      marker.setMap(map);
    }
 })
 var trashNotesView = BaseView.extend({
   events:{
    'click .restore' : 'restoreNote',
    'click .delete':'deletePermanetly'
   },
   name:'trashNote',
   el:'.page',
   initialize:function(){
    this.collection = new Notes();
   },
   deletePermanetly : function(event){
    console.log('deletePermanetly')
    var id = $(event.currentTarget).data('id');
    var $target = $(event.currentTarget)
      , $parent = $target.parents('.trashnote')
    this.note = new NoteModel({_id:id});
    this.note.destroy({
      success:function(){
        window.App.flash('success','success');
        $parent.fadeOut(700,function() {
          $parent.remove();
        });
      },
      error : function(){
        window.App.flash('error','error')
      }
    })
    return false;
   },
   restoreNote:function(event){
    var id = $(event.currentTarget).data('id');
    var $target = $(event.currentTarget)
      , $parent = $target.parents('.trashnote')
    this.note_obj = new BaseModel({});
    this.note_obj.url = '/api/restorenote/'+id
    this.note_obj.save({},{
      success:function(){
        window.App.flash('Note Rstored','success');
        $parent.fadeOut(700,function() {
          $parent.remove();
        });
      },
      error:function(){
       window.App.flash('Something went wrong','error');
      }
    })
    return false
   },
   render:function(){
    var param = {status:'inactive'};
      this.collection.fetch({
        data: $.param(param),
        success:function(){
          TemplateManager.get('trash_notes_template',function(source){
            var template = Handlebars.compile(source);
            var notes = this.collection.toJSON();
            console.log('notes',notes)
            var html = template({notes:notes,isMobile:App.isMobile,User:window.App.User});
            this.$el.html(html);
          }.bind(this)) 
        }.bind(this)
      });
   
   }
 })



var Router = Backbone.Router.extend({
    routes:{
      '': 'home',
      'profile':'profile',
      'sharenote?id=:shareid':'sharenote',  
      'verify?type=:status':'verify',
      'resetpassword?email=:email&passwordtoken=:passwordtoken':'resetPassword',
      'contact':'contact',
      'reminders':'reminders',
      'trash':'trashNotes'

    } ,
    home:function(){
      $('body').css('background','darkkhaki')
      if(window.App.isMobile){
        $('.navbar-brand').html('NoteStickShare')
      }
      if(window.location.hash) return window.location = '/';
      // if(this.currentView && this.currentView.name == 'notelistview'){
      //   return false;
      // }
      this.currentView =  App.commonView.notelistView;
      this.currentView.render(); 
    },
    profile : function(){
      if(window.App.isMobile){
        $('.navbar-brand').html('Profile')
      }
       $('body').css('background','white')
      this.currentView =  App.commonView.userprofileView;
      this.currentView.render();
    },
    verify:function(status){
      if(window.App.isMobile){
        $('.navbar-brand').html('NoteStickShare')
      }
       $('body').css('background','white')
      this.currentView =  App.commonView.verifyView;
      this.currentView.render(status);
    },
    sharenote:function(shareid){
      if(window.App.isMobile){
        $('.navbar-brand').html('NoteStickShare')
      }
       $('body').css('background','white');
      this.currentView = App.commonView.shareNotesView;
      this.currentView.render(shareid);
    },
    resetPassword:function(email,passwordtoken){
      $('body').css('background','white');
      this.currentView = new resetPasswordView(email,passwordtoken);
      this.currentView.render();
    },
    contact:function(){
      if(window.App.isMobile){
        $('.navbar-brand').html('Contact')
      }
     $('body').css('background','white');
      this.currentView = App.commonView.contactView;
      this.currentView.render();
    },
    reminders:function(){
       if(window.App.isMobile){
        $('.navbar-brand').html('Reminders')
      }
      this.currentView = App.commonView.reminderView;
      this.currentView.render();
    },
    trashNotes:function(){
      $('body').css('background','darkkhaki')
      if(window.App.isMobile){
        $('.navbar-brand').html('Trash Notes')
      }
      this.currentView = App.commonView.trashNotesView;
      this.currentView.render();
    },
    execute: function(callback, args) {
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        App.isMobile = true;
      }
      console.log('calling ex')
      if(sessionStorage.getItem('showWelcomeModal')){
        $('#welcome-modal').modal('show');
        sessionStorage.removeItem('showWelcomeModal');
      }
      var that = this;
      window.App.loggedIn(function(err,user){
        console.log('user',err)
        console.log('test')
        if(!App.navBarView){
          App.navBarView = new NavBarView()
          App.navBarView.render();
        } 
        if(!App.signupModal) App.signupModal= new signupView();  
      
        args.push(parseQueryString(args.pop()));
        if (callback) callback.apply(that, args);
      })
      
  }
});
var App = {
    start:function(){
      this.router = new Router();
      if(!this.commonView) this.commonView ={}
      this.commonView.userprofileView = new userProfileView()
      this.commonView.notelistView = new NoteListView();
      this.commonView.noteModalView = new noteView();
      this.commonView.verifyView = new verifyView();
      this.commonView.shareNotesView = new shareNotesView();
      this.commonView.shareNoteModalView = new shareNoteView();
      this.commonView.contactView = new contactView();
      this.commonView.labelView = new labelView();
      this.commonView.reminderView = new reminderView();
      this.commonView.filterModalView = new filterModalView()
      this.commonView.trashNotesView = new trashNotesView();
      // this.commonView.resetPasswordView = new resetPasswordView();
    },
    flash:function(message,type){
      if(type == 'error'){
        $.growl.error({ message: message ,duration:1000,type:'danger'});
      }else{
        $.growl.notice({message:message ,title:'',duration:1000});   
      }
    },
    loggedIn : function(callback){
      var request = $.get('/api/auth/logged_in');

      request.success(function(result) {
        window.App.User =result
        callback(null,result);
      });
      request.error(function(jqXHR, textStatus, errorThrown) {
        callback(errorThrown)
      });
    },
    setLoading:function(loading){
       $('body').toggleClass('loading', loading);

      if(!loading) {
        $('body').css('overflow-y', 'auto');  
      } else {
        $('body').css('overflow-y', 'hidden');
      }
    }
  };
  App.start();
  Backbone.history.start();  
  if(window.location.hash == "#_=_") window.location.hash = "";
jQuery.ajaxSetup({
  beforeSend: function() {
     window.App.setLoading(true)
  },
  complete: function(){
    window.App.setLoading(false)
  },
  success: function() {}
});
   
// $(".modal").on("shown.bs.modal", function()  { // any time a modal is shown
//     var urlReplace = "#dd" ; // make the hash the id of the modal shown
//     history.pushState(null, null, urlReplace); // push state that hash into the url
//   });

//   // If a pushstate has previously happened and the back button is clicked, hide any modals.
//   $(window).on('popstate', function() { 
//     $(".modal").modal('hide');
//   });

// $('div.modal').on('shown.bs.modal', function() {
//   var modal = this;
//   var hash = modal.id;
//   window.location.hash = hash;
//   window.onhashchange = function() {
//     if (!location.hash){
//       $(modal).modal('hide');
//     }
//   }
// });

// $('div.modal').on('hidden.bs.modal', function() {
//   var hash = this.id;
//   history.pushState('', document.title, window.location.pathname);
// });
