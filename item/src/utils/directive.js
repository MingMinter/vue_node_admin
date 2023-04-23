import Vue from "vue";
import {checkPermi,checkRole} from "@/utils/permission";
/**
 *  v-number="{value:0,that:this,form:'form',name:'realDraw'}"
 *  v-number="{value:2,that:this,form:'form',name:'realDraw'}"
 * @param {value} 控制的字数  不传或者为0不限制
 * @param {that} this（vue原型）
 * @param {form} form 参数对象 （一级可不填）
 * @param {name} 对象对应的属性名
 * */
Vue.directive('number', {
  bind(el,query) {
    try {
      el.oninput=()=>{
        let theInput = el.querySelector('input');//el.children[0].value
        //指令传回来的参数
        let queryValue=query.value.value;
        //输入的值
        let value=theInput.value;
        //判断长度
        if(queryValue!==undefined&&queryValue!==""&&queryValue!==0)if(value.length>queryValue)value=value.slice(0,queryValue);
        if(isNaN(Number(value))) return setEvent();
        function setEvent(setvalue=""){
          setTimeout(()=>{
            query.value.form&&query.value.that.$set(query.value.that[query.value.form],query.value.name,setvalue.replace(/[^0-9]/g,''));
            !query.value.form&&query.value.that.$set(query.value.that,query.value.name,setvalue.replace(/[^0-9]/g,''));
          })
        }
        setEvent(value)

      }
    }catch (e) {
      console.error("number自定义指令失效")
    }

  }
});


/**
 * v-money="{value:{int:2,point:3,minus:false},that:this,form:'form',name:'title'}"
 * @param {value} value.int 限制整数字数；value.point 限制小数字数；value.minus 是否可以输入-号
 * @param {that} this（vue原型）
 * @param {form} form 参数对象 （一级可不填）
 * @param {name} 对象对应的属性名
 * */
Vue.directive('money', {
  bind(el,query) {
    el.oninput=()=>{
      try {
        let theInput = el.querySelector('input');//el.children[0].value
        //指令传回来的参数
        let {int,point,minus}=query.value.value||{};
        //输入的值
        let value=theInput.value;
        let reg=/[^0-9.]/g;
        let matchArr=value.match(/\./ig);
        let minusArr=value.match(/-/ig);
        //如果出现多个小数点
        if(matchArr)if(matchArr.length>1)  return setEvent();
        //如果小数点在第一位
        if(value.search(/\./ig)===0) return setEvent();
        //如果出现多个-号
        if(minusArr)if(minusArr.length>1)  return setEvent();
        //如果-号不在第一位
        if(value.search(/-/ig)>0) return setEvent();
        let valueArr=value.split(".");
        //需要输入-号
        if(minus) {
          int=int+1;
          reg=/[^0-9.-]/g;
        }
        //限制整数字数
        if(int)if(valueArr[0].length>int) valueArr[0]=valueArr[0].slice(0,int);
        //限制小数字数
        if(point)if(valueArr.length>1) if(valueArr[1].length>point) valueArr[1]=valueArr[1].slice(0,point);
        value=valueArr.length>1?`${valueArr[0]}.${valueArr[1]}`:valueArr[0];
        function setEvent(setValue=""){
          setTimeout(()=>{
            query.value.form&&query.value.that.$set(query.value.that[query.value.form],query.value.name,setValue.replace(reg,''));
            !query.value.form&&query.value.that.$set(query.value.that,query.value.name,setValue.replace(reg,''));
          })
        }
        setEvent(value)
      }catch (e) {
        console.error("money自定义指令失效")
      }

    }
  }
});

/** v-english="{value:{size:'min',sum:2},that:this,form:'form',name:'name'}"
 *  v-english="{that:this,form:'form',name:'name'}"
 * @param {value} value.size 限制大小写max/min；value.sum 限制输入字数；value.symbol 如果需要特定字符，填入兼容的特定字符 比如：value.symbol='/_-'
 * @param {that} this（vue原型）
 * @param {form} form 参数对象 （一级可不填）
 * @param {name} 对象对应的属性名
 * */
Vue.directive('english', {
  bind(el,query) {
    el.oninput=()=>{
      try {
        let theInput = el.querySelector('input');//el.children[0].value
        //输入的值
        let value=theInput.value;
        //指令传回来的参数
        let {size,sum,symbol}=query.value.value||{};
        //大写
        if(size==="max")value=value.toUpperCase();
        //小写
        if(size==="min")value=value.toLowerCase();
        //字数
        if(sum) value=value.slice(0,sum);
        let reg=/[^a-zA-Z]/g;
        //如果兼容字符
        if(symbol) reg=new RegExp(`[^a-zA-Z${symbol}]`,"g")//g;
        function setEvent(setValue=""){
          setTimeout(()=>{
            query.value.form&&query.value.that.$set(query.value.that[query.value.form],query.value.name,setValue.replace(reg,''));
            !query.value.form&&query.value.that.$set(query.value.that,query.value.name,setValue.replace(reg,''));
          })
        }
        setEvent(value)
      }catch (e) {
        console.error("english自定义指令失效")
      }

    }
  }
})


/**
 * 菜单权限字符
 * @param {Array} value
 * @returns {Boolean}
 */
Vue.directive('hasPermi', {
  inserted(el, binding, vnode) {
    const { value } = binding;
    if(!checkPermi(value)) el.parentNode.removeChild(el);
  }
})

/**
 * 角色权限字符
 * @param {Array} value
 * @returns {Boolean}
 */
Vue.directive('hasRole', {
  inserted(el, binding, vnode) {
    const { value } = binding;
    if(!checkRole(value)) el.parentNode.removeChild(el);
  }
})

