/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is auto-generated. Do not modify it manually.
 * Changes to this file may be overwritten.
 */

export const dataSourcesInfo = {
  "accounts": {
    "tableId": "",
    "version": "",
    "primaryKey": "accountid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "agentnode": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "InvokeAgent": {
        "path": "/{connectionId}/powerautomate/agentnodes/conversations",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "x-ms-conversation-id",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "environmentId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "InvokeDefinition": {
        "path": "/{connectionId}/copilotflows/agentnodes/invokeDefinition",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "x-ms-conversation-id",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "environmentId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      }
    }
  },
  "commondataserviceforapps": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "SubscribeWebhookTrigger": {
        "path": "/{connectionId}/api/data/v9.1/callbackregistrations",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Consistency",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionRequest",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "catalog",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "category",
            "in": "header",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ListRecords": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$orderby",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$expand",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "fetchXml",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "$skiptoken",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "partitionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "CreateRecord": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ListRecordsWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "MSCRM.IncludeMipSensitivityLabel",
            "in": "header",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$orderby",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$expand",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "fetchXml",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "$skiptoken",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "partitionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "CreateRecordWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetItem": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}({recordId})",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$expand",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "partitionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeleteRecord": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}({recordId})",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "partitionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UpdateRecord": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}({recordId})",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UpdateOnlyRecord": {
        "path": "/{connectionId}/api/data/v9.2/{entityName}({recordId})",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "If-Match",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetItemWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}({recordId})",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "MSCRM.IncludeMipSensitivityLabel",
            "in": "header",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$expand",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "partitionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeleteRecordWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}({recordId})",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "partitionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UpdateRecordWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}({recordId})",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UpdateOnlyRecordWithOrganization": {
        "path": "/{connectionId}/api/data/v9.2.0/{entityName}({recordId})",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "prefer",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accept",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "If-Match",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "x-ms-odata-metadata-full",
            "in": "header",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "AssociateEntities": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}({recordId})/{associationEntityRelationship}/$ref",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "associationEntityRelationship",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DisassociateEntities": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}({recordId})/{associationEntityRelationship}/$ref",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "associationEntityRelationship",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$id",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "AssociateEntitiesWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}({recordId})/{associationEntityRelationship}/$ref",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "associationEntityRelationship",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DisassociateEntitiesWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}({recordId})/{associationEntityRelationship}/$ref",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "associationEntityRelationship",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$id",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PerformUnboundAction": {
        "path": "/{connectionId}/flow/api/data/v9.1/{actionName}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "actionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PerformUnboundActionWithOrganization": {
        "path": "/{connectionId}/flow/api/data/v9.1.0/{actionName}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "actionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PerformBoundAction": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}({recordId})/{actionName}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "actionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PerformBoundActionWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}({recordId})/{actionName}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "actionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ExecuteChangeset": {
        "path": "/{connectionId}/api/data/v9.1/$batch",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          }
        }
      },
      "UpdateEntityFileImageFieldContent": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}({recordId})/{fileImageFieldName}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "content-type",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "fileImageFieldName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "string",
            "format": "binary"
          },
          {
            "name": "x-ms-file-name",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UpdateEntityFileImageFieldContentWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}({recordId})/{fileImageFieldName}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "content-type",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "fileImageFieldName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "string",
            "format": "binary"
          },
          {
            "name": "x-ms-file-name",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetEntityFileImageFieldContent": {
        "path": "/{connectionId}/api/data/v9.1/{entityName}({recordId})/{fileImageFieldName}/$value",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Range",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "fileImageFieldName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "size",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "string",
            "format": "binary"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetEntityFileImageFieldContentWithOrganization": {
        "path": "/{connectionId}/api/data/v9.1.0/{entityName}({recordId})/{fileImageFieldName}/$value",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Range",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "organization",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recordId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "fileImageFieldName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "size",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "string",
            "format": "binary"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetRelevantRows": {
        "path": "/{connectionId}/api/search/v1.0/query",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "SearchRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "BusinessEventsTrigger": {
        "path": "/{connectionId}/api/data/v9.2/callbackregistrations",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Consistency",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "catalog",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "category",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PerformBackgroundOperation": {
        "path": "/{connectionId}/api/data/v9.2/{actionName}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "Consistency",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "x-ms-dyn-callback-url",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "catalog",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "category",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "actionName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "202": {
            "type": "object"
          },
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "InvokeMCP": {
        "path": "/{connectionId}/api/mcp",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Mcp-Session-Id",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "InvokeMCPPreview": {
        "path": "/{connectionId}/api/mcp_preview",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Mcp-Session-Id",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "mcp_SalesMCPServer": {
        "path": "/{connectionId}/mcp/SalesMCPServer",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "mcp_ServiceMCPServer": {
        "path": "/{connectionId}/mcp/ServiceMCPServer",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "mcp_ERPMCPServer": {
        "path": "/{connectionId}/mcp/ERPMCPServer",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "mcp_DataverseMCPServer": {
        "path": "/{connectionId}/mcp/DataverseMCPServer",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "mcp_ContactCenterMCPServer": {
        "path": "/{connectionId}/mcp/ContactCenterMCPServer",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "mcp_ConversationOrchestratorMCPServer": {
        "path": "/{connectionId}/mcp/ConversationOrchestratorMCPServer",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      }
    }
  },
  "contacts": {
    "tableId": "",
    "version": "",
    "primaryKey": "contactid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "equipmentreimagined_analyzeconsolidatedimageresults": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "Run": {
        "path": "/{connectionId}/triggers/manual/run",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "input",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "api-version",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      }
    }
  },
  "equipmentreimagined_analyzeimage": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "Run": {
        "path": "/{connectionId}/triggers/manual/run",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "input",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "api-version",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      }
    }
  },
  "msftmfm_assets": {
    "tableId": "",
    "version": "",
    "primaryKey": "msftmfm_assetid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "msftmfm_conditionphotos": {
    "tableId": "",
    "version": "",
    "primaryKey": "msftmfm_conditionphotoid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "msftmfm_rentalagreements": {
    "tableId": "",
    "version": "",
    "primaryKey": "msftmfm_rentalagreementid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "msftmfm_returnbookings": {
    "tableId": "",
    "version": "",
    "primaryKey": "msftmfm_returnbookingid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "msnweather": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "CurrentWeather": {
        "path": "/{connectionId}/current/{Location}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "units",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "OnCurrentWeatherChange": {
        "path": "/{connectionId}/trigger/current/weather/{Location}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Measure",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "When",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "Target",
            "in": "query",
            "required": true,
            "type": "number",
            "format": "float"
          },
          {
            "name": "units",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "OnCurrentConditionsChange": {
        "path": "/{connectionId}/trigger/current/conditions/{Location}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "units",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "TodaysForecast": {
        "path": "/{connectionId}/forecast/today/{Location}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "units",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "TomorrowsForecast": {
        "path": "/{connectionId}/forecast/tomorrow/{Location}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "units",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      }
    }
  },
  "office365users": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "UpdateMyProfile": {
        "path": "/{connectionId}/codeless/v1.0/me",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "default": {
            "type": "void"
          }
        }
      },
      "MyProfile_V2": {
        "path": "/{connectionId}/codeless/v1.0/me",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "UpdateMyPhoto": {
        "path": "/{connectionId}/codeless/v1.0/me/photo/$value",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "string",
            "format": "binary"
          },
          {
            "name": "Content-Type",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "default": {
            "type": "void"
          }
        }
      },
      "MyTrendingDocuments": {
        "path": "/{connectionId}/codeless/beta/me/insights/trending",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "extractSensitivityLabel",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "fetchSensitivityLabelMetadata",
            "in": "query",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "RelevantPeople": {
        "path": "/{connectionId}/users/{userId}/relevantpeople",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "MyProfile": {
        "path": "/{connectionId}/users/me",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "202": {
            "type": "void"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "500": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UserProfile": {
        "path": "/{connectionId}/users/{userId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "202": {
            "type": "void"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "500": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UserPhotoMetadata": {
        "path": "/{connectionId}/users/photo",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UserPhoto": {
        "path": "/{connectionId}/users/photo/value",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "string",
            "format": "binary"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "Manager": {
        "path": "/{connectionId}/users/{userId}/manager",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "202": {
            "type": "void"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "500": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DirectReports": {
        "path": "/{connectionId}/users/{userId}/directReports",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "202": {
            "type": "void"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "500": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "SearchUser": {
        "path": "/{connectionId}/users",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "searchTerm",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "top",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "202": {
            "type": "void"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "500": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "SearchUserV2": {
        "path": "/{connectionId}/v2/users",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "searchTerm",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "top",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "isSearchTermRequired",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "skipToken",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "202": {
            "type": "void"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "500": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UserProfile_V2": {
        "path": "/{connectionId}/codeless/v1.0/users/{id}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "Manager_V2": {
        "path": "/{connectionId}/codeless/v1.0/users/{id}/manager",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "DirectReports_V2": {
        "path": "/{connectionId}/codeless/v1.0/users/{id}/directReports",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "UserPhoto_V2": {
        "path": "/{connectionId}/codeless/v1.0/users/{id}/photo/$value",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "string",
            "format": "binary"
          }
        }
      },
      "TrendingDocuments": {
        "path": "/{connectionId}/codeless/beta/users/{id}/insights/trending",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "extractSensitivityLabel",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "fetchSensitivityLabelMetadata",
            "in": "query",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "HttpRequest": {
        "path": "/{connectionId}/codeless/httprequest",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Uri",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "Method",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "Body",
            "in": "body",
            "required": false,
            "type": "string",
            "format": "binary"
          },
          {
            "name": "ContentType",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader1",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader2",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader3",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader4",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader5",
            "in": "header",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      }
    }
  }
};
