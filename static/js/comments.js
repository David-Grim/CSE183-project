const DEFAULT_SHOW_REPLIES_DEPTH = 2;

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    app.data = {
        user_email: user_email,
        annotations: [],
    };

    app.add_post = (reply_target=null, post_text = app.vue.post_text, line_number=-1) => {
        reply_id = -1; //remains -1 if post is not a reply
        if (reply_target !== null) reply_id = reply_target.id;
        axios.post(add_post_url,
        {
            song_id: song_id,
            reply_id: reply_id,
            post_text: post_text,
            line_number: line_number

        }).then((response) => {
            let post = response.data.post;
            post.posts = [];
            if (reply_target === null) {
                if(post.line_number == -1) {}//app.vue.posts.unshift(post); Non-line specific comments currently unimplemented
                else app.vue.annotations[post.line_number].unshift(post);
            } else reply_target.posts.unshift(post);
        });
   };

    app.change_vote = (comment,rating) => {
        axios.post(vote_post_url,
        {
            comment_id: comment.id,
            rating,

        }).then((response) => {
            //comment = response.data.comment;
            comment.upvotes = response.data.upvotes;
            comment.downvotes = response.data.downvotes;
        });
     };

    app.delete_thread = (comment_id, line_number=-1) => {
        axios.post(delete_post_url,
        {
            comment_id,
            
        }).then(() => {
            if(line_number != -1) {
                Vue.set(app.vue.annotations, line_number, 
                    app.vue.annotations[line_number].filter((post) => post.id != comment_id));
            }
        });
    };
    
    app.delete_reply = (comment_id, parent=null) => {
        axios.post(delete_post_url,
        {
            comment_id,
            
        }).then(() => {
            if(parent !== null) parent.posts = parent.posts.filter((post) => post.id != comment_id);
        });
    };
    
    app.methods = {
        add_post: app.add_post,
        delete_thread: app.delete_thread,
        delete_reply: app.delete_reply,
        change_vote: app.change_vote,
    };

    app.CommentComponent = {
        template: '#comment-template',
        props: [ 'comment', 'parent_comment', 'depth' ],
        data() { return { 
            user_email: app.vue.user_email,
            replying: false,
            input_text: "",
            mouse_hover: false,
            show_children: (this.depth < DEFAULT_SHOW_REPLIES_DEPTH),
        }},
        //reference: https://vuejsdevelopers.com/2017/10/23/vue-js-tree-menu-recursive-components/
        computed: {
            indent() {
            return { transform: `translate(${this.depth * 25}px)` };
            },
        },
        methods: {
            count_votes() {
                return this.comment.upvotes.length - this.comment.downvotes.length;
            },
            vote_state() {
                if (this.comment.upvotes.findIndex((vote) => vote.user_email == user_email) != -1) return 1;
                else if (this.comment.downvotes.findIndex((vote) => vote.user_email == user_email) != -1) return -1;
                else return 0;
            },
            change_vote(rating) {
                app.change_vote(this.comment, rating);
                this.vote = rating;
            },
            delete_post() {
                if(this.parent_comment !== null) {
                    app.delete_reply(this.comment.id, this.parent_comment);
                } else app.delete_thread(this.comment.id, this.comment.line_number);
            },
            add_post() {
                app.add_post(this.comment, this.input_text);
                this.input_text = "";
                this.replying=false;
            },
            toggle_children() {
                this.show_children = !this.show_children;
            },
            
        },
    };
    
    app.LyricLineComponent = {
        template: '#lyric-line-template',
        props: {
            line_text: String,
            comment_arr: Array,
            line_number: Number
        },
        data() { return { 
            showing_annotations: false,
            commenting: false,
            input_text: "",
        }},
        methods: {
            load_annotations() {
                comment_arr = app.vue.annotations[this.line_number];
            },
            toggle_annotations() {
                this.showing_annotations = !this.showing_annotations;
            },
            has_annotations() {
                if (this.comment_arr) return(this.comment_arr.length > 0);
                else return false;
            },
            add_post() {
                app.add_post(null, this.input_text, this.line_number);
                this.comment_arr = app.vue.annotations[this.line_number];
                this.input_text = "";
                this.commenting=false;
            },
            
        },
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods,
        components: {
            'comment': app.CommentComponent,
            'lyric-line': app.LyricLineComponent
        }
    });

    // And this initializes it.
    app.init = () => {
        axios.get(load_posts_url, {params: {"song_id": song_id}}).then((result) => {
            app.vue.annotations = result.data.annotations;
            //app.vue.annotations.forEach(function (posts) {
            //    posts.forEach(function (post) {
            //        app.format_reply_tree(post);
            //    });
            //});
        });
    };

    // Call to the initializer.
    app.init();
};

init(app);
Vue.component('comment', app.CommentComponent);
Vue.component('lyric-line', app.LyricLineComponent);