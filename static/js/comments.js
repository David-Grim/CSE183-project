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
      app.vue.hover_post = null
      let temp = app.vue.hover_post
      app.vue.hover_post = temp
   };

    app.format_post_thumbs = (post) => {
      post.likes = []
      post.dislikes = []
      post.thumbs.forEach((x) => {
         let info = {
            name: x.name,
            user_email: x.user_email
         };
         if(x.rating == 1){
            post.likes.push(info)
         }
         if(x.rating == -1){
            post.dislikes.push(info)
         }
      });
      return post
   };

   app.post_rating = (post,rating) => {
      if(rating === 0){
         return false
      }else{
         let x;
         if (rating == 1) {
            x = post.likes
         }
         if(rating == -1){
            x = post.dislikes
         }
         let i = x.findIndex((user) => user.user_email == user_email)
         return i != -1
      }
   };

    app.add_post = () =>
         axios.post(add_post_url,
         {
            song_id:song_id,
            comment_id:reply_id,
            post_text:app.vue.post_text

         }).then((response) => {
            let post = app.format_post_thumbs(response.data.post)
            app.vue.posts = app.enumerate([response.data.post,...app.vue.posts])
            app.reset_post()
         })
   };

   app.set_post_thumbs = (comment_id,rating) => {
      axios.post(post_thumbs_url,
         {
            comment_id,
            rating,

         }).then((response) => {
            let post = app.format_post_thumbs(response.data.post)
            let index = app.vue.posts.findIndex((post) => post.id == comment_id)
            app.vue.posts[index] = post
            app.vue.posts = app.enumerate(app.vue.posts)
         })
   };

   app.delete_post = (comment_id) => {
     axios.post(delete_post_url,
         {
            comment_id,

         }).then(() => {
            app.vue.posts = app.vue.posts.filter((post) => post.id != comment_id)
         });
  };

   app.set_new_post = (status) => {
      app.vue.add_mode = status
   };
   
   app.set_new_reply = (id) => {
       app.vue.reply_id = id
   };

   app.reset_post = () => {
      app.vue.post_text = ""
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



    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
      axios.get(load_posts_url, {params: {"song_id": song_id}}).then((result) => {
         let posts = result.data.posts.map((post) => app.format_post_thumbs(post))
         app.vue.posts = app.enumerate(posts)
      })
    };

    // Call to the initializer.
    app.init();
};

init(app);
