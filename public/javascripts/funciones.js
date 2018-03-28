Number.prototype.numberFormat = function(decimals, dec_point, thousands_sep) {
    dec_point = typeof dec_point !== 'undefined' ? dec_point : '.';
    thousands_sep = typeof thousands_sep !== 'undefined' ? thousands_sep : ',';

    var parts = this.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);

    return parts.join(dec_point);
}
function formatN(value) {
    if ( value === 0 ) {
        return ''
    }else{
        return  value.numberFormat(2, ',', '.')
    }
}
function formatD(value) {
    var date = new Date(value)
    var year = date.getFullYear()
    var month = (1 + date.getMonth()).toString()
    month = month.length > 1 ? month : '0' + month
    var day = date.getDate().toString()
    day = day.length > 1 ? day : '0' + day
    return day + '/' + month + '/' + year;
}
function isFecha(txtDate){
      var currVal = txtDate;
      if(currVal == '')
        return false;
      //Declare Regex 
      var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
      var dtArray = currVal.match(rxDatePattern); // is format OK?
      if (dtArray == null)
         return false;
      //Checks for mm/dd/yyyy format.
      dtMonth = dtArray[3];
      dtDay= dtArray[1];
      dtYear = dtArray[5];
      if (dtMonth < 1 || dtMonth > 12)
          return false;
      else if (dtDay < 1 || dtDay> 31)
          return false;
      else if ((dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11) && dtDay ==31)
          return false;
      else if (dtMonth == 2)
      {
         var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
         if (dtDay> 29 || (dtDay ==29 && !isleap))
              return false;
      }
      return true;
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function LinkCheck(url) // Verificar si existen Imagenes en la carpeta indicada
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}
function soloNumbers(e){
      var keynum = window.event ? window.event.keyCode : e.which
      if ((keynum == 8) || (keynum == 46))
      return true
      return /\d/.test(String.fromCharCode(keynum))
}
function isInteger(value) {
    if ((undefined === value) || (null === value)) {
        return false;
    }
    return value % 1 == 0;
}
