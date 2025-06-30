

## 获取菜单树


**接口地址**:`/api/system/menu/get-all-menu-tree`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:<p>获取菜单树</p>



**请求参数**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|
|400|Bad Request||
|401|Unauthorized|ResultObject|
|403|Forbidden|ResultObject|
|500|Internal Server Error|ResultObject|


**响应状态码-200**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-401**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-403**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-500**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```



## 更新菜单状态


**接口地址**:`/api/system/menu/update-menu-status`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:<p>更新菜单状态</p>



**请求示例**:


```javascript
{
  "menuIds": "000000,000001",
  "status": "0"
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|updateMenuStatusDTO|UpdateMenuStatusDTO|body|true|UpdateMenuStatusDTO|UpdateMenuStatusDTO|
|&emsp;&emsp;menuIds|菜单ID列表||true|array|string|
|&emsp;&emsp;status|状态||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|
|400|Bad Request||
|401|Unauthorized|ResultObject|
|403|Forbidden|ResultObject|
|500|Internal Server Error|ResultObject|


**响应状态码-200**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-401**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-403**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-500**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```



## 更新菜单排序


**接口地址**:`/api/system/menu/update-menu-sort`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:<p>更新菜单排序</p>



**请求示例**:


```javascript
{
  "menuId": "000000",
  "sort": "0"
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|updateMenuSortDTO|UpdateMenuSortDTO|body|true|UpdateMenuSortDTO|UpdateMenuSortDTO|
|&emsp;&emsp;menuId|菜单ID||true|string||
|&emsp;&emsp;sort|排序||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|
|400|Bad Request||
|401|Unauthorized|ResultObject|
|403|Forbidden|ResultObject|
|500|Internal Server Error|ResultObject|


**响应状态码-200**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-401**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-403**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-500**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```



## 新增-编辑菜单


**接口地址**:`/api/system/menu/insert-or-update-menu`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:<p>新增/编辑菜单,如果有menuId则编辑，否则新增</p>



**请求示例**:


```javascript
{
  "menuId": "000000",
  "parentId": "000000",
  "menuNameZh": "系统管理",
  "menuNameEn": "System Management",
  "menuPath": "/system",
  "menuIcon": "setting",
  "menuSort": "1",
  "status": "0",
  "remark": "备注",
  "roleIds": "000000,000001"
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|insertOrUpdateMenuDTO|InsertOrUpdateMenuDTO|body|true|InsertOrUpdateMenuDTO|InsertOrUpdateMenuDTO|
|&emsp;&emsp;menuId|菜单ID||false|string||
|&emsp;&emsp;parentId|父菜单ID||false|string||
|&emsp;&emsp;menuNameZh|菜单中文名称||false|string||
|&emsp;&emsp;menuNameEn|菜单英文名称||false|string||
|&emsp;&emsp;menuPath|菜单路径||false|string||
|&emsp;&emsp;menuIcon|菜单图标||false|string||
|&emsp;&emsp;menuSort|显示顺序||false|string||
|&emsp;&emsp;status|状态||false|string||
|&emsp;&emsp;remark|备注||false|string||
|&emsp;&emsp;roleIds|关联角色ID列表||false|array|string|


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|
|400|Bad Request||
|401|Unauthorized|ResultObject|
|403|Forbidden|ResultObject|
|500|Internal Server Error|ResultObject|


**响应状态码-200**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-401**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-403**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-500**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```



## 新增-编辑菜单


**接口地址**:`/api/system/menu/insert-or-update-menu`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:<p>新增/编辑菜单,如果有menuId则编辑，否则新增</p>



**请求示例**:


```javascript
{
  "menuId": "000000",
  "parentId": "000000",
  "menuNameZh": "系统管理",
  "menuNameEn": "System Management",
  "menuPath": "/system",
  "menuIcon": "setting",
  "menuSort": "1",
  "status": "0",
  "remark": "备注",
  "roleIds": "000000,000001"
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|insertOrUpdateMenuDTO|InsertOrUpdateMenuDTO|body|true|InsertOrUpdateMenuDTO|InsertOrUpdateMenuDTO|
|&emsp;&emsp;menuId|菜单ID||false|string||
|&emsp;&emsp;parentId|父菜单ID||false|string||
|&emsp;&emsp;menuNameZh|菜单中文名称||false|string||
|&emsp;&emsp;menuNameEn|菜单英文名称||false|string||
|&emsp;&emsp;menuPath|菜单路径||false|string||
|&emsp;&emsp;menuIcon|菜单图标||false|string||
|&emsp;&emsp;menuSort|显示顺序||false|string||
|&emsp;&emsp;status|状态||false|string||
|&emsp;&emsp;remark|备注||false|string||
|&emsp;&emsp;roleIds|关联角色ID列表||false|array|string|


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|
|400|Bad Request||
|401|Unauthorized|ResultObject|
|403|Forbidden|ResultObject|
|500|Internal Server Error|ResultObject|


**响应状态码-200**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-401**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-403**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-500**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```



## 获取菜单关联的角色


**接口地址**:`/api/system/menu/get-menu-role-list`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:<p>获取菜单关联的角色</p>



**请求示例**:


```javascript
{
  "menuId": "000000"
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|menuConditionDTO|MenuConditionDTO|body|true|MenuConditionDTO|MenuConditionDTO|
|&emsp;&emsp;menuId|菜单ID||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|
|400|Bad Request||
|401|Unauthorized|ResultObject|
|403|Forbidden|ResultObject|
|500|Internal Server Error|ResultObject|


**响应状态码-200**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-401**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-403**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-500**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```



## 获取菜单关联的角色


**接口地址**:`/api/system/menu/get-menu-role-list`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:<p>获取菜单关联的角色</p>



**请求示例**:


```javascript
{
  "menuId": "000000"
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|menuConditionDTO|MenuConditionDTO|body|true|MenuConditionDTO|MenuConditionDTO|
|&emsp;&emsp;menuId|菜单ID||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|
|400|Bad Request||
|401|Unauthorized|ResultObject|
|403|Forbidden|ResultObject|
|500|Internal Server Error|ResultObject|


**响应状态码-200**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-401**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-403**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```


**响应状态码-500**:


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|message||string||
|data||object||
|success||boolean||
|timestamp||integer(int64)|integer(int64)|
|traceId||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {},
	"success": true,
	"timestamp": 0,
	"traceId": ""
}
```