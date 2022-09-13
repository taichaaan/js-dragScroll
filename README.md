# js-dragScroll


## Descriptions
ドラッグで移動できるプラグインです。  
targetでは全体を囲む要素を指定してください。


## Class
- is-drag -- ドラッグ中に付与されるクラスです。


## Demo
```
./test/
``` 
test ディレクトリをご確認ください。  
使用する外部プラグインなども同封しています。


## Usage
```JavaScript
new dragScroll('.js-dragScroll',{
	dragSelector: null,
});
```

```SCSS
.js-dragScroll{
	width: 100vw;
	height: 100vh;
	overflow: scroll;
	cursor: grab;
	scrollbar-width: none; /*Firefox対応のスクロールバー非表示コード*/
	-ms-overflow-style: none;/*Internet Explore対応のスクロールバー非表示コード*/
}

.js-dragScroll::-webkit-scrollbar {
	display: none; /*Google Chrome、Safari、Microsoft Edge対応のスクロールバー非表示コード*/
}

.js-dragScroll:active{
	cursor: grabbing;
}
```


## Option
| option | Type | Default | description |
| ---- | ---- | ---- | ---- |
| dragSelector | string | null | ドラッグされる要素を文字列で指定してください。<br>指定がなければ直下の初めの子要素となります。<br>また、dragSelectorは必ずtargetの子要素としてください。 |
| startPosition | strings | null | スタートのポジションを指定してください。<br>'center' or '% %' or 'int int' |
| startClass | string | 'is-start' | スタート直後に付与されるクラスを指定してください。 |
| scrollStartClass | string | 'is-scroll-start' | スクロールした直後に付与されるクラスを指定してください。 |
| dragStartClass | string | 'is-drag-start' | ドラッグした直後に付与されるクラスを指定してください。 |
| startTarget | string | 'this' | startClassを付与するターゲットを指定してください。<br>・'this' -- 自分自身<br>・'parent' -- 親要素<br>・selector -- セレクタ |
| zoom | boolean | true | ズーム機能を使用するか否か。 |
| zoomPlusSelector | string | null | ズームのプラスボタンのセレクタを指定してください。 |
| zoomMinusSelector | string | null | ズームのマイナスボタンのセレクタを指定してください。 |
| zoomDefaultScale | int | 1 | 最初のscaleを指定してください。 |
| zoomScale | int | 0.5 | 一回のズームで拡大・縮小するscaleを指定してください。 |
| zoomMaxScale | int | 2 | ズームのscaleの最大値を指定してください。 |
| zoomMinScale | int | 0.8 | ズームのscaleの最小値を指定してください。<br>autoの場合は、縦もしくは横が全て見えるscaleを自動計算します。<br>int // or auto |
| zoomEventDelay | int | 500 | ズームアニメーションの時間をミリ秒で指定してください。<br>ズームイベントをオフにする時に使用します。<br>},options['zoomEventDelay'] + 100); |
| getSizeEvent | array | ['DOMContentLoaded','load','resize'] | ドラッグできる最大値・最小値を取得するイベントを配列で指定してください。 |



## Method
| name  | description |
| ---- | ---- |
| remove | 全てのイベントを削除する関数です。 |




## 開発環境

### node
v14.14.0


### gulp
v4.0.2

