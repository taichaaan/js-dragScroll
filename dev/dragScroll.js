/*! dragScroll.js | v1.4.1 | license Copyright (C) 2022 Taichi Matsutaka */
/**
 *
 * @name    : dragScroll.js
 * @content : dragScroll
 * @url     : https://github.com/taichaaan/js-dragScroll
 * @creation: 2022.07.30
 * @update  : 2022.09.15
 * @version : 1.4.1
 *
 */
(function(global) {[]
	global.dragScroll = function(target,options){
		///////////////////////////////////////////////////////////////
		// defaults options
		///////////////////////////////////////////////////////////////
		this.target = target;

		const defaults = {
			dragSelector     : null,
			startPosition    : null, // or 'center' or '% %' or 'int int'
			startClass       : 'is-start',
			scrollStartClass : 'is-scroll-start',
			dragStartClass   : 'is-drag-start',
			startTarget      : 'this', // or 'parent' or 'selector',
			zoom             : true,
			zoomPlusSelector : null,
			zoomMinusSelector: null,
			zoomDefaultScale : 1,
			zoomScale        : 0.5,
			zoomMaxScale     : 2,
			zoomMinScale     : 0.8, // or auto
			zoomEventDelay   : 500,
			getSizeEvent     : ['DOMContentLoaded','load','resize'],
		}


		///////////////////////////////////////////////////////////////
		// options
		///////////////////////////////////////////////////////////////
		for( let option in options){
			defaults[option] = options[option];
		}
		this.options = defaults;


		///////////////////////////////////////////////////////////////
		// base
		///////////////////////////////////////////////////////////////
		this.removes = [];
		this.base();


	};
	dragScroll.prototype = {
		base: function(){
			const _this   = this;
			const options = this.options;


			///////////////////////////////////////////////////////////////
			// variable
			///////////////////////////////////////////////////////////////
			const target    = document.querySelector( this.target );
			let inner       = target.querySelector( options['dragSelector'] );
			let startTarget = target;
			let _window     = window;

			/* ---------- _window ---------- */
			if( !inner ){ inner = target.children[0]; }
			if( target.tagName !== 'BODY' ){ _window = target; }

			/* ---------- startTarget ---------- */
			if( options['startTarget'] === 'parent' ){
				startTarget = target.parentNode;
			} else if( options['startTarget'] !== 'this' ){
				startTarget = document.querySelector( options['startTarget'] );
			}

			/* ---------- size ---------- */
			let targetWidth       = target.clientWidth;
			let targetHeight      = target.clientHeight;
			let innerWidth        = inner.getBoundingClientRect().width;
			let innerHeight       = inner.getBoundingClientRect().height;
			let innerNormalWidth  = inner.clientWidth;
			let innerNormalHeight = inner.clientHeight;

			/* ---------- x,y ---------- */
			let defaultScrollLeft = 0;
			let defaultScrollTop  = 0;
			let defaultX = 0;
			let defaultY = 0;
			let mouseX   = 0;
			let mouseY   = 0;
			let valueX   = defaultX - mouseX;
			let valueY   = defaultY - mouseY;
			let maxX = innerWidth - targetWidth;
			let maxY = innerHeight - targetHeight;


			/* ---------- isTouchstart ---------- */
			const isTouchstart = window.ontouchstart === null?"touchstart":"click";




			///////////////////////////////////////////////////////////////
			// target size
			///////////////////////////////////////////////////////////////
			const getTargetSize = function(){
				targetWidth  = target.clientWidth;
				targetHeight = target.clientHeight;
				innerWidth   = inner.getBoundingClientRect().width;
				innerHeight  = inner.getBoundingClientRect().height;
				innerNormalWidth  = inner.clientWidth;
				innerNormalHeight = inner.clientHeight;

				maxX = innerWidth - targetWidth;
				maxY = innerHeight - targetHeight;
			}

			for ( let i = 0; i < options['getSizeEvent'].length; i++ ) {
				window.addEventListener( options['getSizeEvent'][i] ,getTargetSize);

				/* ---------- removes ---------- */
				_this.removes.push( function(){
					window.removeEventListener( options['getSizeEvent'][i] ,getTargetSize);
				});
			}




			///////////////////////////////////////////////////////////////
			// startPosition
			///////////////////////////////////////////////////////////////
			if( options['startPosition'] != null ){
				let startPosition = function(){};
				const positions = options['startPosition'].split(' ');

				if( options['startPosition'] == 'center' ){
					///////////////////////////////////////////
					// center start
					///////////////////////////////////////////
					startPosition = function(){
						valueX = innerWidth / 2 - targetWidth / 2;
						valueY = innerHeight / 2 - targetHeight / 2;
						_window.scrollTo( valueX , valueY );

						defaultScrollLeft = valueX;
						defaultScrollTop  = valueY;
					}

				} else if( positions[0].indexOf('px') != -1  ){
					///////////////////////////////////////////
					// px start
					///////////////////////////////////////////
					startPosition = function(){
						valueX = positions[0].slice( 0, -2 ) ;
						valueY = positions[1].slice( 0, -2 ) ;
						_window.scrollTo( valueX , valueY );

						defaultScrollLeft = valueX;
						defaultScrollTop  = valueY;
					}

				} else if( positions[0].indexOf('%') != -1  ){
					///////////////////////////////////////////
					// % center start
					///////////////////////////////////////////
					startPosition = function(){
						const pctX = positions[0].slice( 0, -1 ) ;
						const pctY = positions[1].slice( 0, -1 ) ;

						valueX = innerWidth * (pctX / 100) - targetWidth / 2;
						valueY = innerHeight * (pctY / 100) - targetHeight / 2;
						_window.scrollTo( valueX , valueY );

						defaultScrollLeft = valueX;
						defaultScrollTop  = valueY;
					}

				}

				window.addEventListener('load',startPosition);
			}




			///////////////////////////////////////////////////////////////
			// addStartClass
			///////////////////////////////////////////////////////////////
			const addStartClass = function(){
				startTarget.classList.add( options['startClass'] );
			}





			///////////////////////////////////////////////////////////////
			// scroll
			///////////////////////////////////////////////////////////////
			let scrollFlg = true;

			const onScroll = function(){
				addStartClass();
				startTarget.classList.add( options['scrollStartClass'] );

				if( scrollFlg === true ){
					defaultScrollLeft = _window.scrollLeft;
					defaultScrollTop  = _window.scrollTop;
				}
			}
			window.addEventListener('load',function(){
				setTimeout(function(){
					_window.addEventListener('scroll',onScroll);
				},200);
			});

			/* ---------- removes ---------- */
			_this.removes.push( function(){
				_window.removeEventListener('scroll',onScroll);
			});



			///////////////////////////////////////////////////////////////
			// drag
			///////////////////////////////////////////////////////////////
			///////////////////////////////////////////
			// judgment
			///////////////////////////////////////////
			const judgment = function(){
				if( valueX < 0 ){
					valueX = 0;
				} else if( valueX > maxX ){
					valueX = maxX;
				}

				if( valueY < 0 ){
					valueY = 0;
				} else if( valueY > maxY ){
					valueY = maxY;
				}
			}



			///////////////////////////////////////////
			// onMousemove
			///////////////////////////////////////////
			const onMousemove = function(){
				scrollFlg = false;

				mouseX = event.clientX || event.changedTouches[0].clientX;
				mouseY = event.clientY || event.changedTouches[0].clientY;

				valueX = defaultX - mouseX + defaultScrollLeft;
				valueY = defaultY - mouseY + defaultScrollTop;

				judgment();

				/* scroll */
				_window.scrollTo( valueX , valueY );
			}


			///////////////////////////////////////////
			// onMouseup
			///////////////////////////////////////////
			const onMouseup = function(){
				scrollFlg = true;

				document.body.setAttribute('onSelectStart','');
				target.classList.remove('is-drag');
				defaultScrollLeft = _window.scrollLeft;
				defaultScrollTop  = _window.scrollTop;

				target.removeEventListener('mousemove',onMousemove);
				target.removeEventListener('touchmove',onMousemove);
			}


			///////////////////////////////////////////
			// onMousedown
			///////////////////////////////////////////
			const onMousedown = function(){
				addStartClass();
				startTarget.classList.add( options['dragStartClass'] );

				defaultX = event.clientX || event.changedTouches[0].clientX;
				defaultY = event.clientY || event.changedTouches[0].clientY;

				document.body.setAttribute('onSelectStart','return false'); // テキスト選択無効
				target.classList.add('is-drag');

				target.addEventListener('mousemove',onMousemove);
				target.addEventListener('touchmove',onMousemove);
			}


			///////////////////////////////////////////
			// event
			// pcのみ発動し、タブレット・スマホでは通常のタップスクロールで移動
			///////////////////////////////////////////
			window.addEventListener( 'load' ,function(){
				if( isTouchstart == 'click' ){
					target.addEventListener('mousedown',onMousedown);
					target.addEventListener('mouseup',onMouseup);
					target.addEventListener('mouseleave',onMouseup);
					document.body.addEventListener('mouseleave',onMouseup);

					/* ---------- removes ---------- */
					_this.removes.push( function(){
						target.removeEventListener('mousemove',onMousemove);
						target.removeEventListener('mouseup',onMouseup);
						target.addEventListener('mouseleave',onMouseup);
						document.body.addEventListener('mouseleave',onMouseup);
					});
				}
			});






			///////////////////////////////////////////////////////////////
			// zoom
			///////////////////////////////////////////////////////////////
			if( options['zoom'] === true ){
				let scale         = options['zoomDefaultScale'];
				const plusButton  = document.querySelector( options['zoomPlusSelector'] );
				const minusButton = document.querySelector( options['zoomMinusSelector'] );

				let scaleMaxFlg = false;
				let scaleMinFlg = false;


				///////////////////////////////////////////
				// scaleInnerSize
				// ズームするときの一回の拡大値を取得
				///////////////////////////////////////////
				let scaleInnerSizeWidth  = innerNormalWidth * options['zoomScale'];
				let scaleInnerSizeHeight = innerNormalHeight * options['zoomScale'];

				const getScaleInnerSize = function(){
					scaleInnerSizeWidth  = innerNormalWidth * options['zoomScale'];
					scaleInnerSizeHeight = innerNormalHeight * options['zoomScale'];
				}

				for ( let i = 0; i < options['getSizeEvent'].length; i++ ) {
					window.addEventListener( options['getSizeEvent'][i] ,getScaleInnerSize);

					/* ---------- removes ---------- */
					_this.removes.push( function(){
						window.removeEventListener( options['getSizeEvent'][i] ,getScaleInnerSize);
					});
				}


				///////////////////////////////////////////
				// zoomMinScale
				// zoomMinScaleがautoの時の最小値を取得
				// 横幅と高さのどちらかが全て見えるまでのscale
				///////////////////////////////////////////
				let zoomMinScale = options['zoomMinScale'];

				if( options['zoomMinScale'] == 'auto' ){
					const getZoomMinScale = function(){
						const scaleX = targetWidth / innerNormalWidth;
						const scaleY = targetHeight / innerNormalHeight;

						zoomMinScale = Math.max(scaleX,scaleY);
					}
					getZoomMinScale();

					for ( let i = 0; i < options['getSizeEvent'].length; i++ ) {
						window.addEventListener( options['getSizeEvent'][i] ,getZoomMinScale);

						/* ---------- removes ---------- */
						_this.removes.push( function(){
							window.removeEventListener( options['getSizeEvent'][i] ,getZoomMinScale);
						});
					}
				}


				///////////////////////////////////////////
				// scaleLevels
				// scaleの一覧を生成
				// scaleLevelsを元に拡大させる
				///////////////////////////////////////////
				let scaleLevels = null;
				let scaleIndex  = null;
				let scaleLength = null;

				window.addEventListener('load',function(){
					scaleLevels = [zoomMinScale , options['zoomDefaultScale']];
					let scaleLevelValue = options['zoomDefaultScale'];

					/* ----- 拡大 ----- */
					for ( let i = 0; i < 100; i++ ) {
						scaleLevelValue += options['zoomScale'];

						if( scaleLevelValue > options['zoomMaxScale'] ){
							scaleLevelValue = options['zoomMaxScale'];
							break;
						}
						scaleLevels.push( scaleLevelValue );
					}

					/* -----  縮小 ----- */
					/* 初期値からスタート */
					scaleLevelValue = options['zoomDefaultScale'];

					for ( let i = 0; i < 100; i++ ) {
						scaleLevelValue -= options['zoomScale'];

						if( scaleLevelValue < zoomMinScale ){
							scaleLevelValue = zoomMinScale;
							break;
						}
						scaleLevels.push( scaleLevelValue );
					}


					/* -----  並び替え ----- */
					const f = function (a, b) {
						return a - b
					}

					scaleLevels.sort(f);
					scaleIndex = scaleLevels.indexOf( options['zoomDefaultScale'] );
					scaleLength = scaleLevels.length;
				});


				///////////////////////////////////////////
				// zoomMargin
				// transform-originでずれる分をmarginで戻す
				///////////////////////////////////////////
				const zoomMargin = function(){
					if( scale !== 1 ){
						inner.style.marginLeft = -( inner.getBoundingClientRect().left ) - defaultScrollLeft + 'px';
						inner.style.marginTop  = -( inner.getBoundingClientRect().top ) - defaultScrollTop + 'px';
					}
				}


				///////////////////////////////////////////
				// zoomOut
				// ズームを解除するときの関数
				///////////////////////////////////////////
				const zoomOut = function(){
					setTimeout(function(){
						getTargetSize();

						valueX = Math.abs( inner.getBoundingClientRect().left );
						valueY = Math.abs( inner.getBoundingClientRect().top );

						judgment();

						defaultScrollLeft = valueX;
						defaultScrollTop  = valueY;

						/* ---------- position ---------- */
						if( scale < 1 ){
							inner.style.marginRight  = '-'+ innerNormalWidth - innerWidth +'px';
							inner.style.marginBottom = '-'+ innerNormalHeight - innerHeight +'px';
						} else{
							inner.style.marginRight  = '';
							inner.style.marginBottom = '';
						}

						inner.style.transformOrigin = '0px 0px';
						inner.style.marginLeft  = '';
						inner.style.marginTop = '';
						_window.scrollTo( valueX , valueY );

						/* ---------- class ---------- */
						target.classList.remove('is-zoom');
						plusButton.classList.remove('is-zoom');
						minusButton.classList.remove('is-zoom');

					},options['zoomEventDelay'] + 100);
				}




				///////////////////////////////////////////
				// zoomDefaultScale
				///////////////////////////////////////////
				if( options['zoomDefaultScale'] < 1 ){
					inner.style.marginRight  = '-'+ innerNormalWidth - innerWidth +'px';
					inner.style.marginBottom = '-'+ innerNormalHeight - innerHeight +'px';
				}




				///////////////////////////////////////////
				// click
				///////////////////////////////////////////
				window.addEventListener('load',function(){

					///////////////////////////////////////////
					// 拡大
					///////////////////////////////////////////
					if( plusButton ){
						plusButton.addEventListener('click',function(e){
							e.preventDefault();

							if( scaleMaxFlg == true ){
								return false;
							}

							target.classList.add('is-zoom');
							plusButton.classList.add('is-zoom');


							/* ---------- origin ---------- */
							const scaleRatio = 1 / scale;

							defaultScrollLeft = -( inner.getBoundingClientRect().left );
							defaultScrollTop  = -( inner.getBoundingClientRect().top );

							const originX = ( targetWidth / 2 + defaultScrollLeft ) * scaleRatio;
							const originY = ( targetHeight / 2 + defaultScrollTop ) * scaleRatio;

							inner.style.transformOrigin = originX + 'px ' + originY + 'px';


							/* ----- margin ----- */
							zoomMargin();


							/* ---------- scale ---------- */
							scaleIndex++;
							scale = scaleLevels[scaleIndex];

							if( scaleIndex == scaleLength - 1 ){
								scaleMaxFlg = true;
								plusButton.classList.add('is-disabled');
							} else{
								scaleMinFlg = false;
								minusButton.classList.remove('is-disabled');
							}

							inner.style.transform = 'scale('+ scale +')';


							/* ---------- 戻す ---------- */
							zoomOut();
						});
					}


					///////////////////////////////////////////
					// 縮小
					///////////////////////////////////////////
					if( minusButton ){
						minusButton.addEventListener('click',function(e){
							e.preventDefault();

							if( scaleMinFlg == true ){
								return false;
							}

							target.classList.add('is-zoom');
							minusButton.classList.add('is-zoom');


							/* ---------- origin ---------- */
							const scaleRatio = 1 / scale;
							let originX = 0;
							let originY = 0;

							defaultScrollLeft = -( inner.getBoundingClientRect().left );
							defaultScrollTop  = -( inner.getBoundingClientRect().top );

							if( defaultScrollLeft < scaleInnerSizeWidth / 2 ){
								originX = 0;
							} else if( defaultScrollLeft > innerWidth - scaleInnerSizeWidth / 2 ){
								originX = innerWidth - scaleInnerSizeWidth * scaleRatio + 'px';
							} else{
								originX = ( targetWidth / 2 + defaultScrollLeft ) * scaleRatio + 'px';
							}

							if( defaultScrollTop < scaleInnerSizeHeight / 2 ){
								originY = 0;
							} else if( defaultScrollTop > innerHeight - scaleInnerSizeHeight / 2 ){
								originY = innerHeight - scaleInnerSizeHeight * scaleRatio + 'px';
							} else{
								originY = ( targetHeight / 2 + defaultScrollTop ) * scaleRatio + 'px';
							}

							inner.style.transformOrigin = originX + ' ' + originY;


							/* ----- margin ----- */
							zoomMargin();


							/* ---------- scale ---------- */
							scaleIndex--;

							if( scaleIndex == 0 ){
								scaleMinFlg = true;
								scale       = zoomMinScale;
								minusButton.classList.add('is-disabled');
							} else{
								scaleMaxFlg = false;
								scale       = scaleLevels[scaleIndex];
								plusButton.classList.remove('is-disabled');
							}

							inner.style.transform = 'scale('+ scale +')';

							/* ---------- 戻す ---------- */
							zoomOut();
						});

					}

				});
			}




		},
		remove: function(){
			/* removes に追加された関数をforで一つずつ実行する。 */
			const removes = this.removes;

			if( !removes ) return;

			for ( let i = 0; i < removes.length; i++ ) {
				removes[i]();
			}
		},
	};

})(this);
