import { combineLatest } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

export default class Posts {
  constructor(element) {
    this.parentElement = element;
    this.url = 'https://merge-observables-rxjs.herokuapp.com';
    // this.url = 'http://localhost:7104';
    this.dateOptions = { year: '2-digit', month: '2-digit', day: '2-digit' };
    this.timeOptions = { minute: '2-digit', hour: '2-digit' };
  }

  init() {
    const stream1$ = ajax(`${this.url}/comments/latest`).pipe(
      map((userResponse) => userResponse.response),
    );

    const stream2$ = ajax(`${this.url}/posts/latest`).pipe(
      map((userResponse) => userResponse.response),
    );

    const combineStream$ = combineLatest(stream2$, stream1$);

    const sub = combineStream$.subscribe(
      ([stream2, stream1]) => {
        for (const post of stream2) {
          const result = stream1.filter((el) => el.postId === post.id);
          this.constructorPost(post, result);
        }
      },
    );

    setTimeout(() => {
      sub.unsubscribe();
    }, 5000);
  }

  constructorPost(post, comments) {
    const postElem = document.createElement('div');
    postElem.classList.add('post');
    postElem.innerHTML = `<div class="post_title">${post.title}</div>
      <div class="post_content">${post.body}</div>
      <p>Latest comments</p>
      <ul class="post_comments">
        ${this.constructorCommentList(comments)}
      </ul>`;
    this.addPost(postElem);
  }

  constructorCommentList(comments) {
    let commentsElem = '';
    for (const comment of comments) {
      const date = new Date(comment.created);
      const commentElem = document.createElement('li');
      commentElem.classList.add('comment');
      commentElem.innerHTML = `<div class="comment_data">
      <div class="comment_author">${comment.authorName}</div>
      <div class="comment_date">${date.toLocaleString('ru-RU', this.timeOptions)}, ${date.toLocaleString('ru-RU', this.dateOptions)}</div>
      </div>
      <div class="comment_body">${comment.body}</div>`;
      commentsElem += commentElem.outerHTML;
    }
    return commentsElem;
  }

  addPost(post) {
    this.parentElement.append(post);
  }
}
