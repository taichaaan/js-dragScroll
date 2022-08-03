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
| centerStart | boolean | true | 中央からスタートする場合は、trueを指定して下さい。 |
| startClass | string | 'is-start' | スタート直後に付与されるクラスを指定してください。 |
| getMaxSizeEvent | array | ['DOMContentLoaded','load','resize'] | ドラッグできる最大値・最小値を取得するイベントを配列で指定してください。 |



## Method
| name  | description |
| ---- | ---- |
| remove | 全てのイベントを削除する関数です。 |




## 開発環境

### node
v14.14.0


### gulp
v4.0.2

