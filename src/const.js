/* query urls */
global.SERVER = "http://127.0.0.1:3000/mnger/";
global.URL_LOGIN = global.SERVER + "login";
global.URL_DATATARGET_GET_CUSTOMERS = global.SERVER + "datatarget/customers";
global.URL_DATATARGET_ADD_QUOTA = global.SERVER + "datatarget/quota";
global.URL_DATATARGET_CHECK_CONFLICT = global.SERVER + "datatarget/conflict";
global.URL_DATATARGET_IMEIS = global.SERVER + "datatarget/imeis";
global.URL_DATATARGET_IMEIS_STATISTICS = global.SERVER + "datatarget/imeis/statistics";
global.URL_DATATARGET_IMEI_ONLINE = global.SERVER + "datatarget/imei/online"
global.URL_DATATARGET_IMEI_PUBED = global.SERVER + "datatarget/imei/pubed"

global.VADDSERVER = "http://www.alphanbiot.com:10088/vaddservice/";
global.VURL_DATATARGET_PUB = global.VADDSERVER + "pub";

/* cookie */
global.COOKIE_EXPIRED = 1;
global.COOKIE_EXPIRED_UNIT = 'day'; //minute hour day