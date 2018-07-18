/* query urls */
//global.SERVER = "http://192.168.20.53:7070/mnger/";
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
global.URL_VCP_ACCOUNT_RETAIL = global.SERVER + "vcp/account/retail";
global.URL_VCP_ACCOUNT_RETAIL_NAME_CHECK = global.SERVER + "vcp/account/retail/name/check";
global.URL_VCP_NAME_CHECK = global.SERVER + "vcp/name/check";
global.URL_SUBJECT_CUST = global.SERVER + "subjectcust";
global.URL_SUBJECT = global.SERVER + "subject";
global.URL_VERIFYTASK_TERMINAL = global.SERVER + "verifytask/terminal";
global.URL_VERIFYTASK_TERMINAL_STATUS = global.SERVER + "verifytask/terminal/status";
global.URL_VT_CONSUME_NEXTRATE = global.SERVER + "consume/nextrate";

global.URL_VTF_CHECK_DEVIATION = global.SERVER + "vtf/deviation";
global.URL_VTF_CHECK_ITEMS = global.SERVER + "vtf/items";

/** vadd server */
global.VADDSERVER = "http://www.alphanbiot.com:10088/vaddservice/mnger/v1/";
//global.VADDSERVER = "http://192.168.20.53:10088/vaddservice/mnger/v1/";
global.VURL_DATATARGET_PUB = global.VADDSERVER + "datatarget/pub";
global.VURL_VCP_ACCOUNT = global.VADDSERVER + "vcp/account";
global.VURL_VCP_ACCOUNT_CHARGE = global.VADDSERVER + "vcp/account/recharge";
global.VURL_VCP_SUBJECT_UPDATE = global.VADDSERVER + "vcpcust/update";
global.VURL_VCP_SUBJECT = global.VADDSERVER + "vcpcust";
global.VURL_VCP_SUBJECT_STATUS = global.VADDSERVER + "subject";
global.VURL_VCP_ACCOUNT_RETAIL = global.VADDSERVER + "vcp/account/retail";
global.VURL_VCP_ACCOUNT_RETAIL_PWD = global.VADDSERVER + "vcp/account/retail/pwd";
global.VURL_VCP_ACCOUNT_RETAIL_LOCK = global.VADDSERVER + "vcp/account/retail/lock";

/* cookie */
global.COOKIE_EXPIRED = 1;
global.COOKIE_EXPIRED_UNIT = 'day'; //minute hour day