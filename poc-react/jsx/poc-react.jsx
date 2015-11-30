
lastid = 5;

flux = new (function () {

	var actions = this.actions = Reflux.createActions(['selectTab', 'sendMessage', 'getUsers', 'getMedias', 'getMessages', 'setMediaFilter']);

	this.tabStore = Reflux.createStore({

		listenables: [actions],

		onSelectTab : function (tabname) {
			this.trigger(tabname);
		}
	});

	this.mediasStore = Reflux.createStore({

		listenables: [actions],

		onGetMedias : function (conversationId) {
			this.trigger({
				medias : [{
					id : 1,
					lnk : 'media-folder/joker.png',
					auth : 'lionel',
					date : 'hier',
					dl :  ''
				},{
					id : 2,
					lnk : 'media-folder/joker.png',
					auth : 'lionel',
					date : 'hier',
					dl :  ''
				},{
					id : 3,
					lnk : 'media-folder/joker.png',
					auth : 'lionel',
					date : 'hier',
					dl :  ''
				}]
			});
		}
	});

	this.usersStore = Reflux.createStore({

		listenables: [actions],

		onGetUsers : function (conversationId) {
			this.trigger({
				users : [{
					id : 1,
					avatar : 'media-folder/dude.png',
					name : 'lionel 2',
					inactiv : 'hier',
					logged :  'il y a 3 jours'
				},{
					id : 2,
					avatar : 'media-folder/dude.png',
					name : 'lionel',
					inactiv : 'hier',
					logged :  'il y a 4 jours'
				}]
			});
		}
	});

	this.messagesStore = Reflux.createStore({

		listenables: [actions],

		onGetMessages : function (conversationId, date) {
			this.trigger({
				messages : [{
					id : 1,
					text : 'le tout premier message de l\'appli',
					author : 'lionel',
					date : 'ce matin'
				}]
			}, 'oldMessages');
		},

		onSendMessage  : function (msgtxt) {
			this.trigger({
				message : {
					id : lastid ++,
					text : msgtxt,
					author : 'lionel',
					date : 'ce matin'
				}
			}, 'newMessage');
		}
	});


}) ();


MessageWriter  = React.createClass({


	getInitialState : function () {
		return {
			message : ''
		};
	},

	sendMessage : function() {
		flux.actions.sendMessage(this.state.message);
		this.setState(this.getInitialState);
	},

	update : function (e) {
            this.setState({message :  e.target.value});
	},

	render : function () {
		return <div className="message-writer">
            <input value={this.state.message} onChange={this.update}/>
			<button onClick={this.sendMessage}>envoi</button>
		</div>;
	}
});

Message = React.createClass ({

	readable : function(date) {
		return '';
	},

	render : function () {
		return <div> 
			<div>
				<div>{this.props.content.text}</div>
				<div>{this.props.content.author}</div>
			</div>
			<div>{this.props.content.date}</div>
		</div>;
	}
});


Conversation = React.createClass ({

    mixins: [Reflux.ListenerMixin],

    _ : {

    	newMessage : function(comp, data) {
    		
    		comp.state.messages.push(data.message);
        	comp.setState({messages : comp.state.messages });
    	},

    	oldMessages : function(comp, data) {

    		comp.setState({messages : data.messages.concat(comp.state.messages) });
    	},
    },

    componentDidMount: function() {
    	var comp = this;
        comp.listenTo(flux.messagesStore, function (data, usecase) {
        	comp._[usecase](comp, data);
        });
        flux.actions.getMessages();
    },

	getInitialState : function () {
		return {
			messages : []
		}
	},

	render : function () {
		return <div className="conversation">
			<div className="messages">
				<div className="messages-history">
				{this.state.messages.map (function (message) {
					return <Message key={message.id}  content={message} />;
				})}
				</div>
				<MessageWriter />
			</div>
		</div>
	}
}); 

User = React.createClass({
	render : function () {
		return <div>
			<img src={this.props.content.avatar} />
			<div>{this.props.content.name}</div>
			<div> inactif depuis {this.props.content.inactiv}</div>
		</div>
	}
});

UsersTab = React.createClass({


    mixins: [Reflux.ListenerMixin],

    componentDidMount: function() {
    	var comp = this;
        comp.listenTo(flux.usersStore, function (data) {
        	comp.setState({list : data.users});
        });
        flux.actions.getUsers();
    },

	getInitialState : function () {
		return  {list : []};
	},
	
	render : function () {
		return <div>
			{this.state.list.map(function (user){
				return <User key={user.id} content={user} />;
			} )}
		</div>
	}
});

Media = React.createClass({
	render : function () {
		return <div className="media-container">
			<img src={this.props.content.lnk} />
		</div>
	}
});

MediasTab = React.createClass({
	

    mixins: [Reflux.ListenerMixin],

    componentDidMount: function() {
    	var comp = this;
        comp.listenTo(flux.mediasStore, function (data) {
        	comp.setState({list : data.medias});
        });
        flux.actions.getMedias();
    },

	getInitialState : function () {
		return  {list : [], mediaFilter:'' };
	},
	
	render : function () {
		return <div> 
			{this.state.list.map(function (media){
				return <Media key={media.id} content={media} />;
			} )}
		</div>
	}
});


Panel = React.createClass({

	tabs : {
		users : <UsersTab />,
		medias : <MediasTab />
	},

    mixins: [Reflux.ListenerMixin],

    componentDidMount: function() {
    	var comp = this;
        comp.listenTo(flux.tabStore, function (selectedtab) {
        	comp.setState({tab : selectedtab});
        });
    },

	getInitialState : function () {
		return {
			tab : 'users'
		}
	},

	select : function (tabname) {

		return function () {
        	flux.actions.selectTab (tabname);	
		}
	},

	render : function () {

		var comp = this;
		var selectedIf = function (name) {
			return comp.state.tab === name ? 'selected' : '';
		}

		return <div className="panel">

			<div className="headers">
				<span className={selectedIf('users')} onClick={this.select('users')}>Membres</span>
				<span className={selectedIf('medias')} onClick={this.select('medias')}>Partage</span>
			</div>
			<div className="tab-content">
				{this.tabs[this.state.tab]}
			</div>

		</div>;
	}
}); 


App = React.createClass ({


	render : function () {
		return <div className="root">
			<Conversation  />
			<Panel />
		</div>
	}

});


React.render(<App />, document.getElementById('apphost'));


