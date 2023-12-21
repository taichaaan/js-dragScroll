/*! dragScroll.js | v2.0.0 | license Copyright (C) 2022 - 2023 Taichi Matsutaka */
/**
 *
 * @name    : dragScroll.js
 * @content : dragScroll
 * @url     : https://github.com/taichaaan/js-dragScroll
 * @creation: 2022.07.30
 * @update  : 2023.12.21
 * @version : 2.0.0
 * @Note    : Only construction is considered, not reconstruction or destruction.
 *            Breakpoints are also not considered.
 *
 *
 */
(function(global) {[]
	global.dragScroll = function(target,options){
		const _this = this;

		/**************************************************************
		 * defaults options
		************************************************************ */
		this.target = document.querySelector( target );

		const defaults = {
			mediaQuery       : null,
			dragSelector     : null,
			startPosition    : null, // or 'center' or '% %' or 'int int'
			startClass       : 'is-start',
			scrollStartClass : 'is-scroll-start',
			dragStartClass   : 'is-drag-start',
			startTarget      : 'this', // or 'parent' or 'selector',
			currentSelector  : null,
			keepSelector     : null,
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


		/**************************************************************
		 * options
		************************************************************ */
		for( let option in options){
			defaults[option] = options[option];
		}
		this.options = defaults;


		/**************************************************************
		 * property
		************************************************************ */
		this._window     = window;

		this.inner       = this.target.querySelector( this.options['dragSelector'] );
		this.startTarget = this.target;

		this.currentSelector = document.querySelector( this.options['currentSelector'] );
		this.keepSelector    = document.querySelectorAll( this.options['keepSelector'] );
		this.plusButton      = document.querySelector( this.options['zoomPlusSelector'] );
		this.minusButton     = document.querySelector( this.options['zoomMinusSelector'] );

		if( !this.inner ){ this.inner = this.target.children[0]; }
		if( this.target.tagName !== 'BODY' ){ this._window = this.target; }

		if( this.options['startTarget'] === 'parent' ){
			this.startTarget = this.target.parentNode;
		} else if( this.options['startTarget'] !== 'this' ){
			this.startTarget = document.querySelector( this.options['startTarget'] );
		}

		this.targetWidth       = this.target.clientWidth;
		this.targetHeight      = this.target.clientHeight;
		this.innerWidth        = this.inner.getBoundingClientRect().width;
		this.innerHeight       = this.inner.getBoundingClientRect().height;
		this.innerNormalWidth  = this.inner.clientWidth;
		this.innerNormalHeight = this.inner.clientHeight;

		this.defaultScrollLeft = 0;
		this.defaultScrollTop  = 0;
		this.defaultX          = 0;
		this.defaultY          = 0;
		this.mouseX            = 0;
		this.mouseY            = 0;
		this.valueX            = this.defaultX - this.mouseX;
		this.valueY            = this.defaultY - this.mouseY;
		this.maxX              = this.innerWidth - this.targetWidth;
		this.maxY              =this. innerHeight - this.targetHeight;

		this.isTouchstart = window.ontouchstart === null?"touchstart":"click";
		this.scrollFlg    = true;

		this.scale       = this.options['zoomDefaultScale'];
		this.scaleFlg    = false;
		this.scaleMaxFlg = false;
		this.scaleMinFlg = false;

		this.scaleLevels = null;
		this.scaleIndex  = null;
		this.scaleLength = null;

		this.scaleInnerSizeWidth  = this.innerNormalWidth * this.options['zoomScale'];
		this.scaleInnerSizeHeight = this.innerNormalHeight * this.options['zoomScale'];

		this.zoomMinScale = this.options['zoomMinScale'];



		/**************************************************************
		 * method
		**************************************************************/
		this.getSize();
		this.startPosition();
		this.isScroll();
		this.drag();
		this.zoom();
	};
	dragScroll.prototype = {
		getSize: function(){
			const _this = this;

			/**************************************************************
			 * getTargetSize
			**************************************************************/
			_this.getTargetSize = function(){
				_this.targetWidth       = _this.target.clientWidth;
				_this.targetHeight      = _this.target.clientHeight;
				_this.innerWidth        = _this.inner.getBoundingClientRect().width;
				_this.innerHeight       = _this.inner.getBoundingClientRect().height;
				_this.innerNormalWidth  = _this.inner.clientWidth;
				_this.innerNormalHeight = _this.inner.clientHeight;

				_this.maxX = _this.innerWidth - _this.targetWidth;
				_this.maxY = _this.innerHeight - _this.targetHeight;
			}

			for ( let i = 0; i < _this.options['getSizeEvent'].length; i++ ) {
				window.addEventListener( _this.options['getSizeEvent'][i] ,_this.getTargetSize);
			}
		},
		startPosition: function(){
			const _this = this;

			/**************************************************************
			 * startPosition
			**************************************************************/
			if( _this.options['startPosition'] != null ){
				let startPosition = function(){};
				const positions = _this.options['startPosition'].split(' ');

				if( _this.options['startPosition'] == 'center' ){
					///////////////////////////////////////////
					// center start
					///////////////////////////////////////////
					startPosition = function(){
						_this.valueX = _this.innerWidth / 2 - _this.targetWidth / 2;
						_this.valueY = _this.innerHeight / 2 - _this.targetHeight / 2;
						_this._window.scrollTo( _this.valueX , _this.valueY );

						_this.defaultScrollLeft = _this.valueX;
						_this.defaultScrollTop  = _this.valueY;
					}

				} else if( positions[0].indexOf('px') != -1  ){
					///////////////////////////////////////////
					// px start
					///////////////////////////////////////////
					startPosition = function(){
						_this.valueX = positions[0].slice( 0, -2 ) ;
						_this.valueY = positions[1].slice( 0, -2 ) ;
						_this._window.scrollTo( _this.valueX , _this.valueY );

						_this.defaultScrollLeft = _this.valueX;
						_this.defaultScrollTop  = _this.valueY;
					}

				} else if( positions[0].indexOf('%') != -1  ){
					///////////////////////////////////////////
					// % center start
					///////////////////////////////////////////
					startPosition = function(){
						const pctX = positions[0].slice( 0, -1 ) ;
						const pctY = positions[1].slice( 0, -1 ) ;

						_this.valueX = _this.innerWidth * (pctX / 100) - _this.targetWidth / 2;
						_this.valueY = _this.innerHeight * (pctY / 100) - _this.targetHeight / 2;
						_this._window.scrollTo( _this.valueX , _this.valueY );

						_this.defaultScrollLeft = _this.valueX;
						_this.defaultScrollTop  = _this.valueY;
					}

				}

				window.addEventListener('load',startPosition);
			}
		},
		addStartClass: function(){
			const _this = this;

			/**************************************************************
			 * addStartClass
			**************************************************************/
			_this.startTarget.classList.add( _this.options['startClass'] );
		},
		isScroll: function(){
			const _this = this;

			/**************************************************************
			 * isScroll
			**************************************************************/
			const onScroll = function(){
				_this.addStartClass();
				_this.startTarget.classList.add( _this.options['scrollStartClass'] );

				if( _this.scrollFlg === true ){
					_this.defaultScrollLeft = _this._window.scrollLeft;
					_this.defaultScrollTop  = _this._window.scrollTop;
				}
			}
			window.addEventListener('load',function(){
				setTimeout(function(){
					_this._window.addEventListener('scroll',onScroll);
				},200);
			});
		},
		isScroll: function(){
			const _this = this;

			/**************************************************************
			 * isScroll
			**************************************************************/
			const onScroll = function(){
				_this.addStartClass();
				_this.startTarget.classList.add( _this.options['scrollStartClass'] );

				if( _this.scrollFlg === true ){
					_this.defaultScrollLeft = _this._window.scrollLeft;
					_this.defaultScrollTop  = _this._window.scrollTop;
				}
			}
			window.addEventListener('load',function(){
				setTimeout(function(){
					_this._window.addEventListener('scroll',onScroll);
				},200);
			});
		},
		judgment: function(){
			const _this = this;

			/**************************************************************
			 * judgment
			**************************************************************/
			if( _this.valueX < 0 ){
				_this.valueX = 0;
			} else if( _this.valueX > _this.maxX ){
				_this.valueX = _this.maxX;
			}

			if( _this.valueY < 0 ){
				_this.valueY = 0;
			} else if( _this.valueY > _this.maxY ){
				_this.valueY = _this.maxY;
			}
		},
		drag: function(){
			const _this = this;

			/**************************************************************
			 * drag
			**************************************************************/
			/******************************************
			 * onMousemove
			******************************************/
			const onMousemove = function(){
				_this.scrollFlg = false;

				_this.mouseX = event.clientX || event.changedTouches[0].clientX;
				_this.mouseY = event.clientY || event.changedTouches[0].clientY;

				_this.valueX = _this.defaultX - _this.mouseX + _this.defaultScrollLeft;
				_this.valueY = _this.defaultY - _this.mouseY + _this.defaultScrollTop;

				_this.judgment();

				/* scroll */
				_this._window.scrollTo( _this.valueX , _this.valueY );
			}


			/******************************************
			 * onMouseup
			******************************************/
			const onMouseup = function(){
				_this.scrollFlg = true;

				document.body.setAttribute('onSelectStart','');
				_this.target.classList.remove('is-drag');
				_this.defaultScrollLeft = _this._window.scrollLeft;
				_this.defaultScrollTop  = _this._window.scrollTop;

				_this.target.removeEventListener('mousemove',onMousemove);
				_this.target.removeEventListener('touchmove',onMousemove);
			}


			/******************************************
			 * onMousedown
			******************************************/
			const onMousedown = function(){
				if( event.button == 0 ){
					_this.addStartClass();
					_this.startTarget.classList.add( _this.options['dragStartClass'] );

					_this.defaultX = event.clientX || event.changedTouches[0].clientX;
					_this.defaultY = event.clientY || event.changedTouches[0].clientY;

					document.body.setAttribute('onSelectStart','return false'); // テキスト選択無効
					_this.target.classList.add('is-drag');

					_this.target.addEventListener('mousemove',onMousemove);
					_this.target.addEventListener('touchmove',onMousemove, {passive: true} );
				}
			}


			/******************************************
			 * event
			******************************************/
			window.addEventListener( 'load' ,function(){
				if( _this.isTouchstart == 'click' ){
					_this.target.addEventListener('mousedown',onMousedown);
					_this.target.addEventListener('mouseup',onMouseup);
					_this.target.addEventListener('mouseleave',onMouseup);
					document.body.addEventListener('mouseleave',onMouseup);
				}
			});

		},
		zoom: function(){
			const _this = this;

			if( _this.options['zoom'] === false ){
				return false;
			}

			/**************************************************************
			 * setup zoom
			**************************************************************/

			/******************************************
			 * zoomDefaultScale
			 * デフォルトのズーム
			******************************************/
			if( _this.options['zoomDefaultScale'] < 1 ){
				_this.inner.style.marginRight  = '-'+ _this.innerNormalWidth - _this.innerWidth +'px';
				_this.inner.style.marginBottom = '-'+ _this.innerNormalHeight - _this.innerHeight +'px';
			}


			/******************************************
			 * scaleInnerSize
			 * ズームするときの一回の拡大値を取得
			******************************************/
			const getScaleInnerSize = function(){
				_this.scaleInnerSizeWidth  = _this.innerNormalWidth * _this.options['zoomScale'];
				_this.scaleInnerSizeHeight = _this.innerNormalHeight * _this.options['zoomScale'];
			}

			for ( let i = 0; i < _this.options['getSizeEvent'].length; i++ ) {
				window.addEventListener( _this.options['getSizeEvent'][i] ,getScaleInnerSize);
			}


			/******************************************
			 * zoomMinScale
			 * zoomMinScaleがautoの時の最小値を取得
			 * 横幅と高さのどちらかが全て見えるまでのscale
			******************************************/
			if( _this.options['zoomMinScale'] == 'auto' ){
				const getZoomMinScale = function(){
					const scaleX = _this.targetWidth / _this.innerNormalWidth;
					const scaleY = _this.targetHeight / _this.innerNormalHeight;

					_this.zoomMinScale = Math.max(scaleX,scaleY);
				}
				getZoomMinScale();

				for ( let i = 0; i < _this.options['getSizeEvent'].length; i++ ) {
					window.addEventListener( _this.options['getSizeEvent'][i] ,getZoomMinScale);
				}
			}


			/******************************************
			 * scaleLevels
			 * scaleの一覧を生成
			 * scaleLevelsを元に拡大させる
			******************************************/
			window.addEventListener('load',function(){
				_this.scaleLevels   = [_this.zoomMinScale , _this.options['zoomDefaultScale']];
				let scaleLevelValue = _this.options['zoomDefaultScale'];

				/* ----- 拡大 ----- */
				for ( let i = 0; i < 100; i++ ) {
					scaleLevelValue += _this.options['zoomScale'];

					if( scaleLevelValue > _this.options['zoomMaxScale'] ){
						scaleLevelValue = _this.options['zoomMaxScale'];
						break;
					}
					_this.scaleLevels.push( scaleLevelValue );
				}

				/* -----  縮小 ----- */
				/* 初期値からスタート */
				scaleLevelValue = _this.options['zoomDefaultScale'];

				for ( let i = 0; i < 100; i++ ) {
					scaleLevelValue -= _this.options['zoomScale'];

					if( scaleLevelValue < _this.zoomMinScale ){
						scaleLevelValue = _this.zoomMinScale;
						break;
					}
					_this.scaleLevels.push( scaleLevelValue );
				}


				/* -----  並び替え ----- */
				const f = function (a, b) {
					return a - b
				}

				_this.scaleLevels.sort(f);
				_this.scaleIndex  = _this.scaleLevels.indexOf( _this.options['zoomDefaultScale'] );
				_this.scaleLength = _this.scaleLevels.length;
			});


			/******************************************
			 * zoomMargin
			 * transform-originでずれる分をmarginで戻す
			******************************************/
			const zoomMargin = function(){
				if( _this.scale !== 1 ){
					_this.inner.style.marginLeft = -( _this.inner.getBoundingClientRect().left ) - _this.defaultScrollLeft + 'px';
					_this.inner.style.marginTop  = -( _this.inner.getBoundingClientRect().top ) - _this.defaultScrollTop + 'px';
				}
			}


			/******************************************
			 * zoomOut
			 * ズームを解除するときの関数
			******************************************/
			const zoomOut = function(){
				setTimeout(function(){
					_this.getTargetSize();

					_this.valueX = Math.abs( _this.inner.getBoundingClientRect().left );
					_this.valueY = Math.abs( _this.inner.getBoundingClientRect().top );

					_this.judgment();

					_this.defaultScrollLeft = _this.valueX;
					_this.defaultScrollTop  = _this.valueY;

					/* ---------- position ---------- */
					if( _this.scale < 1 ){
						_this.inner.style.marginRight  = '-'+ _this.innerNormalWidth - _this.innerWidth +'px';
						_this.inner.style.marginBottom = '-'+ _this.innerNormalHeight - _this.innerHeight +'px';
					} else{
						_this.inner.style.marginRight  = '';
						_this.inner.style.marginBottom = '';
					}

					_this.inner.style.transformOrigin = '0px 0px';
					_this.inner.style.marginLeft      = '';
					_this.inner.style.marginTop       = '';
					_this._window.scrollTo( _this.valueX , _this.valueY );

					/* ---------- class ---------- */
					_this.target.classList.remove('is-zoom');
					_this.plusButton.classList.remove('is-zoom');
					_this.minusButton.classList.remove('is-zoom');

					/* ---------- flg ---------- */
					_this.scaleFlg = false;

				},_this.options['zoomEventDelay'] + 100);
			}


			/******************************************
			 * keepScale
			 * 比率を保持する要素のtransformを設定
			******************************************/
			let keepScale = function(){};

			if( _this.keepSelector ){
				keepScale = function(){
					const scale = _this.innerNormalWidth / ( _this.innerNormalWidth * _this.scale );

					for ( let i = 0; i < _this.keepSelector.length; i++ ) {
						_this.keepSelector[i].style.transform = 'scale('+ scale +')';
					}
				}
			}


			/******************************************
			 * outputCurrentPercentage
			 * 現在の%を出力
			******************************************/
			let outputCurrentPercentage = function(){};

			if( _this.currentSelector ){
				outputCurrentPercentage = function(){
					_this.currentSelector.innerHTML = Math.round(_this.scale * 100);
				}
			}



			/**************************************************************
			 * click zoom
			**************************************************************/
			window.addEventListener('load',function(){

				/******************************************
				 * plusButton
				******************************************/
				if( _this.plusButton ){
					_this.plusButton.addEventListener('click',function(e){
						e.preventDefault();

						/* ---------- flg ---------- */
						if( _this.scaleFlg == true ){
							return false;
						}
						if( _this.scaleMaxFlg == true ){
							return false;
						}

						_this.scaleFlg = true;


						/* ---------- class ---------- */
						_this.target.classList.add('is-zoom');
						_this.plusButton.classList.add('is-zoom');


						/* ---------- origin ---------- */
						const scaleRatio = 1 / _this.scale;

						_this.defaultScrollLeft = -( _this.inner.getBoundingClientRect().left );
						_this.defaultScrollTop  = -( _this.inner.getBoundingClientRect().top );

						const originX = ( _this.targetWidth / 2 + _this.defaultScrollLeft ) * scaleRatio;
						const originY = ( _this.targetHeight / 2 + _this.defaultScrollTop ) * scaleRatio;

						_this.inner.style.transformOrigin = originX + 'px ' + originY + 'px';


						/* ----- margin ----- */
						zoomMargin();


						/* ---------- scale ---------- */
						_this.scaleIndex++;
						_this.scale = _this.scaleLevels[_this.scaleIndex];

						if( _this.scaleIndex == _this.scaleLength - 1 ){
							_this.scaleMaxFlg = true;
							_this.plusButton.classList.add('is-disabled');
						} else{
							_this.scaleMinFlg = false;
							_this.minusButton.classList.remove('is-disabled');
						}

						_this.inner.style.transform = 'scale('+ _this.scale +')';


						/* ---------- keepScale ---------- */
						keepScale();


						/* ---------- outputCurrentPercentage ---------- */
						outputCurrentPercentage();


						/* ---------- 戻す ---------- */
						zoomOut();
					});
				}


				/******************************************
				 * minusButton
				******************************************/
				if( _this.minusButton ){
					_this.minusButton.addEventListener('click',function(e){
						e.preventDefault();

						/* ---------- flg ---------- */
						if( _this.scaleFlg == true ){
							return false;
						}
						if( _this.scaleMinFlg == true ){
							return false;
						}

						_this.scaleFlg = true;


						/* ---------- class ---------- */
						_this.target.classList.add('is-zoom');
						_this.minusButton.classList.add('is-zoom');


						/* ---------- origin ---------- */
						const scaleRatio = 1 / _this.scale;
						let originX = 0;
						let originY = 0;

						_this.defaultScrollLeft = -( _this.inner.getBoundingClientRect().left );
						_this.defaultScrollTop  = -( _this.inner.getBoundingClientRect().top );

						if( _this.defaultScrollLeft < _this.scaleInnerSizeWidth / 2 ){
							originX = 0;
						} else if( _this.defaultScrollLeft > _this.innerWidth - _this.scaleInnerSizeWidth / 2 ){
							originX = _this.innerWidth - _this.scaleInnerSizeWidth * scaleRatio + 'px';
						} else{
							originX = ( _this.targetWidth / 2 + _this.defaultScrollLeft ) * scaleRatio + 'px';
						}

						if( _this.defaultScrollTop < _this.scaleInnerSizeHeight / 2 ){
							originY = 0;
						} else if( _this.defaultScrollTop > _this.innerHeight - _this.scaleInnerSizeHeight / 2 ){
							originY = _this.innerHeight - _this.scaleInnerSizeHeight * scaleRatio + 'px';
						} else{
							originY = ( _this.targetHeight / 2 + _this.defaultScrollTop ) * scaleRatio + 'px';
						}

						_this.inner.style.transformOrigin = originX + ' ' + originY;


						/* ----- margin ----- */
						zoomMargin();


						/* ---------- scale ---------- */
						_this.scaleIndex--;

						if( _this.scaleIndex == 0 ){
							_this.scaleMinFlg = true;
							_this.scale       = _this.zoomMinScale;
							_this.minusButton.classList.add('is-disabled');
						} else{
							_this.scaleMaxFlg = false;
							_this.scale       = _this.scaleLevels[_this.scaleIndex];
							_this.plusButton.classList.remove('is-disabled');
						}

						_this.inner.style.transform = 'scale('+ _this.scale +')';


						/* ---------- keepScale ---------- */
						keepScale();


						/* ---------- outputCurrentPercentage ---------- */
						outputCurrentPercentage();


						/* ---------- 戻す ---------- */
						zoomOut();
					});

				}

			});
		},
	};

})(this);
