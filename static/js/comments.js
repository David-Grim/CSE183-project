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
    app.set_hover_post = (comment=null) => {
        if(comment) { app.vue.hover_post = comment.id; }
        else app.vue.hover_post = -1;
    };
    
    app.get_hover_post = () => {
        return hover_post;
    };

    app.refresh = () => {
        app.vue.hover_post = null;
        let temp = app.vue.hover_post;
        app.vue.hover_post = temp;
    };

    app.format_post_thumbs = (post) => {
        post.likes = [];
        post.dislikes = [];
        post.thumbs.forEach((x) => {
            let info = {
            name: x.name,
            user_email: x.user_email
            };
            if(x.rating == 1){
                post.likes.push(info);
            }
            if(x.rating == -1){
                post.dislikes.push(info);
            }
        });
        //return post;
   };

   app.post_rating = (post,rating) => {
    if(rating === 0){
        return false;
    } else{
        let x;
        if (rating == 1) {
            x = post.likes;
        }
        if(rating == -1){
            x = post.dislikes;
        }
        let i = x.findIndex((user) => user.user_email == user_email);
        return i != -1;
    }
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
            app.format_post_thumbs(post);
            post.posts = [];
            if (reply_target === null) {
                if(post.line_number == -1) app.vue.posts.unshift(post);
                else app.vue.annotations[post.line_number].unshift(post);
                //else app.vue.annotations[post.line_number] = [post,...app.vue.annotations[post.line_number]];
            } else reply_target.posts.unshift(post);
            app.reset_post();
        });
   };

    app.set_post_thumbs = (comment,rating) => {
        axios.post(post_thumbs_url,
        {
            comment_id: comment.id,
            rating,

        }).then((response) => {
            comment.thumbs = response.data.post.thumbs;
            app.format_post_thumbs(comment);
            /*
            let post = app.format_post_thumbs(response.data.post);
            let index = app.vue.posts.findIndex((post) => post.id == comment.id);
            app.vue.posts[index] = post;
            app.vue.posts = app.enumerate(app.vue.posts);
            */
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

    app.set_new_post = (status) => {
        app.vue.add_mode = status;
    };

    app.reset_post = () => {
        app.vue.post_text = "";
    };
   
    app.set_new_reply = (id) => {
        app.vue.reply_id = id;
    };

    app.format_reply_tree = (post) => {
        post.likes = [];
        post.dislikes = [];
        post.thumbs.forEach((x) => {
            let info = {
            name: x.name,
            user_email: x.user_email
            };
            if(x.rating == 1){
                post.likes.push(info);
            }
            if(x.rating == -1){
                post.dislikes.push(info);
            }
        });
        post.posts.forEach(function (post) {
            app.format_reply_tree(post);
        });
    };
    
    app.methods = {
        reset_post: app.reset_post,
        set_hover_post: app.set_hover_post,
        add_post: app.add_post,
        delete_thread: app.delete_thread,
        delete_reply: app.delete_reply,
        set_new_post: app.set_new_post,
        post_rating: app.post_rating,
        set_post_thumbs: app.set_post_thumbs,
        set_new_reply: app.set_new_reply,
        format_reply_tree: app.format_reply_tree,
    };

    app.CommentComponent = {
        template: '#comment-template',
        props: [ 'comment', 'parent_comment', 'depth' ],
        data() { return { 
            user_email: app.vue.user_email,
            replying: false,
            input_text: "",
            mouse_hover: false,
            show_children: (this.depth < DEFAULT_SHOW_REPLIES_DEPTH)
        }},
        computed: {
            indent() {
            return { transform: `translate(${this.depth * 30}px)` };
            }
        },
        methods: {
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
            set_hover_post(comment) { app.set_hover_post(comment); },
            get_hover_post() { return app.get_hover_post(); },
            set_post_thumbs(comment, val) { 
                app.set_post_thumbs(comment, val);
            },
            post_rating(comment,val) { return app.post_rating(comment,val); },
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
            app.vue.annotations.forEach(function (posts) {
                posts.forEach(function (post) {
                    app.format_reply_tree(post);
                });
            });
        });
    };

    // Call to the initializer.
    app.init();
};

init(app);
Vue.component('comment', app.CommentComponent);
Vue.component('lyric-line', app.LyricLineComponent);