/* query urls */
global.SERVER = "http://127.0.0.1:3000/mnger/";
global.URL_LOGIN = global.SERVER + "login";
global.URL_DATATARGET_GET_CUSTOMERS = global.SERVER + "datatarget/customers";
global.URL_DATATARGET_ADD_QUOTA = global.SERVER + "datatarget/quota";
global.URL_DATATARGET_CHECK_CONFLICT = global.SERVER + "datatarget/conflict";
global.URL_DATATARGET_IMEIS = global.SERVER + "datatarget/imeis";
global.URL_DATATARGET_ONE_IMEI = global.SERVER + "datatarget/sigleimei";
global.URL_DATATARGET_IMEIS_STATISTICS = global.SERVER + "datatarget/imeis/statistics";
global.URL_DATATARGET_IMEI_ONLINE = global.SERVER + "datatarget/imei/online";
global.URL_DATATARGET_IMEI_PUBED = global.SERVER + "datatarget/imei/pubed";
global.URL_DATATARGET_CUSTOMERS_CHECK = global.SERVER + "datatarget/customer/count";
global.URL_DATATARGET_DEL_CUSTOMER = global.SERVER + "datatarget/customer/delete";
global.URL_DATATARGET_GET_DTTASK = global.SERVER + "datatarget/tasks";
global.URL_VCP_ACCOUNTS = global.SERVER + "vcp/accounts";
global.URL_VCP_ACCOUNT = global.SERVER + "vcp/account";
global.URL_VCP_SUB_CUST = global.SERVER + "vcp/subcust";
global.URL_VCP_NAME_CHECK = global.SERVER + "vcp/name/check";
global.URL_SUBJECT_CUST = global.SERVER + "subjectcust";

/** vadd server */
global.VADDSERVER = "http://www.alphanbiot.com:10088/vaddservice/";
global.VURL_DATATARGET_PUB = global.VADDSERVER + "pub";
global.VURL_VCP_ACCOUNT = global.VADDSERVER + "vcp/account";
global.VURL_VCP_ACCOUNT_UPDATE = global.VADDSERVER + "vcp/account/update";
global.VURL_VCP_SUBJECT_UPDATE = global.VADDSERVER + "vcpcust/update";
global.VURL_VCP_SUBJECT = global.VADDSERVER + "vcpcust";

/* cookie */
global.COOKIE_EXPIRED = 1;
global.COOKIE_EXPIRED_UNIT = 'day'; //minute hour day