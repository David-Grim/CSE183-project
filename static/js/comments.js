// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    app.data = {
        user_email: user_email,
        posts: [],
        hover_post: null,
        post_text: "",
        add_mode: false,
        reply_id: -1,
    };

    app.enumerate = (a) => {
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.set_hover_post = (comment_id) => {
      app.vue.hover_post = comment_id;
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
      return post;
   };

   app.post_rating = (post,rating) => {
      if(rating === 0){
         return false;
      }else{
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

    app.add_post = (reply_target=null, post_text = app.vue.post_text) => {
         reply_id = -1; //remains -1 if post is not a reply
         if (reply_target !== null) reply_id = reply_target.id;
         axios.post(add_post_url,
         {
            song_id: song_id,
            reply_id: reply_id,
            post_text: post_text

         }).then((response) => {
            let post = app.format_post_thumbs(response.data.post);
            post.posts = [];
            if (reply_target === null) { app.vue.posts = app.enumerate([response.data.post,...app.vue.posts]);
            } else reply_target.posts = app.enumerate([response.data.post,...reply_target.posts]);
            app.reset_post();
         });
   };

   app.set_post_thumbs = (comment_id,rating) => {
      axios.post(post_thumbs_url,
         {
            comment_id,
            rating,

         }).then((response) => {
            let post = app.format_post_thumbs(response.data.post);
            let index = app.vue.posts.findIndex((post) => post.id == comment_id);
            app.vue.posts[index] = post;
            app.vue.posts = app.enumerate(app.vue.posts);
         });
   };

   app.delete_post = (comment_id, parent=null) => {
     axios.post(delete_post_url,
         {
            comment_id,
            
         }).then(() => {
             if(parent!==null) { parent.posts = parent.posts.filter((post) => post.id != comment_id); }
             else { app.vue.posts = app.vue.posts.filter((post) => post.id != comment_id); }
             
             
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

    app.methods = {
        reset_post: app.reset_post,
        set_hover_post: app.set_hover_post,
        add_post: app.add_post,
        delete_post: app.delete_post,
        set_new_post: app.set_new_post,
        post_rating: app.post_rating,
        set_post_thumbs: app.set_post_thumbs,
        set_new_reply: app.set_new_reply,
    };

/*
    app.components - {
        'test_component': {
            template: `
                <div> {{ comment.post_txt }}
            </div>
            `,
            props: [ 'comment' ],
            data() { return {} },
        }
};*/

    app.CommentComponent = {
            template: `
            
            <div> {{ comment.post_text }}
            <span v-if="comment.user_email == user_email" v-on:click="delete_post()" class="has-text-danger is-pulled-right">
                <i class="fa fa-trash fa-fw"></i>
              </span>
            
            
            <span v-else>
                <button v-on:click="replying=true" class="button is-primary is-size-5 is-pulled-right">
                    <i class="fa fa-reply fa-fw"></i>
                </button>
                <div v-if="replying">
                    <div class="field">
                        <textarea v-model="input_text" class="textarea" placeholder="Type something!"></textarea>
                    </div>
                    <button v-on:click="add_post()" class="button is-primary is-size-5">Post</button>
                    <button v-on:click="replying = false" class="button is-warning is-size-5">Cancel</button>
                </div>
              </span>
              </div>
            `,
        props: [ 'comment', 'parent_comment' ],
        data() { return { 
            user_email: app.vue.user_email,
            replying: false,
            input_text: ""
        }},
        methods: {
            delete_post() {
                app.delete_post(this.comment.id, this.parent_comment);
            },
            add_post() {
                app.add_post(this.comment, this.input_text);
                this.input_text = "";
                this.replying=false;
            },
        },
    };
    
    app.CommentTreeComponent = {
                template: `
    <div class="tree-menu has-background-white">
    <div class="show_replies" @click="toggleChildren">
      <div :style="indent">  
        
        <comment 
        :comment="post"
        :parent_comment="parent_post"
        ></comment>
        
        <div v-if="post.posts.length" class="fa">Show Replies</div>
      </div>
    </div>
    <tree-menu 
      v-if="showChildren"
      v-for="reply in post.posts" 

      :post="reply"
      :parent_post="post"
      :depth="depth + 1"   
    >
    </tree-menu>
  </div>
  `,
  props: [ 'post', 'parent_post', 'depth' ],
  data() {
     return {
       showChildren: false
     }
  },
  computed: {
    indent() {
      return { transform: `translate(${this.depth * 50}px)` }
    }
  },
  methods: {
    toggleChildren() {
       this.showChildren = !this.showChildren;
    }
  },
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods,
        components: {
            'comment': app.CommentComponent,
            'tree-menu': app.CommentTreeComponent
        }
    });

    // And this initializes it.
    app.init = () => {
      axios.get(load_posts_url, {params: {"song_id": song_id}}).then((result) => {
         let posts = result.data.posts.map((post) => app.format_post_thumbs(post));
         app.vue.posts = app.enumerate(posts);
      });
    };

    // Call to the initializer.
    app.init();
};

init(app);
Vue.component('comment', app.CommentComponent);
Vue.component('tree-menu', app.CommentTreeComponent);