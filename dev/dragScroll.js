/*! dragScroll.js | v1.1.0 | license Copyright (C) 2022 Taichi Matsutaka */
/*
 *
 * @name    : dragScroll.js
 * @content : dragScroll
 * @url     : https://github.com/taichaaan/js-dragScroll
 * @creation: 2022.07.30
 * @update  : 2022.08.03
 * @version : 1.1.0
 *
 */
(function(global) {[]
	global.dragScroll = function(target,options){
		///////////////////////////////////////////////////////////////
		// defaults options
		///////////////////////////////////////////////////////////////
		this.target = target;

		const defaults = {
			dragSelector   : null,
			centerStart    : true,
			startClass     : 'is-start',
			getMaxSizeEvent: ['DOMContentLoaded','load','resize'],
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
			const target = document.querySelector( this.target );
			let inner    = target.querySelector( options['dragSelector'] );
			let _window  = window;

			if( !inner ){ inner = target.children[0]; }
			if( target.tagName !== 'BODY' ){ _window = target; }

			/* ---------- x,y ---------- */
			let left     = 0;
			let top      = 0;
			let defaultX = 0;
			let defaultY = 0;
			let mouseX   = 0;
			let mouseY   = 0;
			let valueX   = defaultX - mouseX;
			let valueY   = defaultY - mouseY;




			///////////////////////////////////////////////////////////////
			// target size
			///////////////////////////////////////////////////////////////
			let maxX = inner.clientWidth - target.clientWidth;
			let maxY = inner.clientHeight - target.clientHeight;

			const getTargetSize = function(){
				maxX = inner.clientWidth - target.clientWidth;
				maxY = inner.clientHeight - target.clientHeight;
			}

			for ( let i = 0; i < options['getMaxSizeEvent'].length; i++ ) {
				window.addEventListener( options['getMaxSizeEvent'][i] ,getTargetSize);

				/* ---------- removes ---------- */
				_this.removes.push( function(){
					window.removeEventListener( options['getMaxSizeEvent'][i] ,getTargetSize);
				});
			}




			///////////////////////////////////////////////////////////////
			// centerStart
			///////////////////////////////////////////////////////////////
			if( options['centerStart'] === true ){
				const centerStart = function(){
					valueX = inner.clientWidth / 2 - target.clientWidth / 2;
					valueY = inner.clientHeight / 2 - target.clientHeight / 2;
					_window.scrollTo( valueX , valueY );

					left = valueX;
					top  = valueY;
				}

				window.addEventListener('load',centerStart);

				/* ---------- removes ---------- */
				_this.removes.push( function(){
					window.removeEventListener('load',centerStart);
				});
			}




			///////////////////////////////////////////////////////////////
			// scroll
			///////////////////////////////////////////////////////////////
			let scrollFlg = true;

			const onScroll = function(){
				target.classList.add( options['startClass'] );

				if( scrollFlg === true ){
					left = _window.scrollLeft;
					top  = _window.scrollTop;
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
			// onMousemove
			///////////////////////////////////////////
			const onMousemove = function(){
				scrollFlg = false;

				mouseX = event.clientX || event.changedTouches[0].clientX;
				mouseY = event.clientY || event.changedTouches[0].clientY;

				valueX = defaultX - mouseX + left;
				valueY = defaultY - mouseY + top;

				/* 最小値・最大値 */
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
				left = valueX;
				top  = valueY;

				target.removeEventListener('mousemove',onMousemove);
				target.removeEventListener('touchmove',onMousemove);
			}


			///////////////////////////////////////////
			// onMousedown
			///////////////////////////////////////////
			const onMousedown = function(){
				target.classList.add( options['startClass'] );

				defaultX = event.clientX || event.changedTouches[0].clientX;
				defaultY = event.clientY || event.changedTouches[0].clientY;

				document.body.setAttribute('onSelectStart','return false'); // テキスト選択無効
				target.classList.add('is-drag');

				target.addEventListener('mousemove',onMousemove);
				target.addEventListener('touchmove',onMousemove);
			}


			///////////////////////////////////////////
			// event
			///////////////////////////////////////////
			/* ----- pc ----- */
			target.addEventListener('mousedown',onMousedown);
			target.addEventListener('mouseup',onMouseup);
			target.addEventListener('mouseleave',onMouseup);
			document.body.addEventListener('mouseleave',onMouseup);

			/* ----- sp ----- */
			target.addEventListener('touchstart',onMousedown);
			target.addEventListener('touchend',onMouseup);
			target.addEventListener('touchend',onMouseup);
			document.body.addEventListener('touchend',onMouseup);

			/* ---------- removes ---------- */
			_this.removes.push( function(){
				/* ----- pc ----- */
				target.removeEventListener('mousemove',onMousemove);
				target.removeEventListener('mouseup',onMouseup);
				target.addEventListener('mouseleave',onMouseup);
				document.body.addEventListener('mouseleave',onMouseup);

				/* ----- sp ----- */
				target.removeEventListener('touchmove',onMousemove);
				target.removeEventListener('touchend',onMouseup);
				target.addEventListener('touchend',onMouseup);
				document.body.addEventListener('touchend',onMouseup);
			});



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
