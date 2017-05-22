{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "_artifactsLocation": {
      "type": "string"
    },
    "_artifactsLocationSasToken": {
      "type": "securestring"
    },
    "servicePrincipalClientID": {
      "type": "securestring"
    },
    "servicePrincipalAppKey": {
      "type": "securestring"
    },
    "servicePrincipalTenant": {
      "type": "string"
    },
    "source-sql-serverName": {

      "type": "string",
      "defaultValue": "[concat('source-sql-server', uniqueString(resourceGroup().id))]"
    },
    "dw-sql-serverName": {
      "type": "string",
      "defaultValue": "[concat('dw-sql-server', uniqueString(resourceGroup().id))]"
    },
    "sqlserver-login-name": {
      "type": "string"
    },
    "sqlserver-login-password": {
      "type": "securestring"
    },
    "data-factory-name": {
      "type": "string",
      "defaultValue": "[concat('adf', uniqueString(resourceGroup().id))]"
    },
    "data-lake-account-name": {
      "type": "string",
      "defaultValue": "[concat('adls', uniqueString(resourceGroup().id))]"
    },
    "pipeline-paused-state": {
      "type": "bool",
      "defaultValue": true
    },
    "pipeline-start-date": {
      "type": "string"
    },
    "pipeline-end-date": {
      "type": "string"
    }



  },
  "variables": {
    
    "demo-adls-storeTemplateFolder": "nestedtemplates",
    "demo-adls-storeTemplateFileName": "demo-adls-store.json",
    "demo-data-factoryTemplateFolder": "nestedtemplates",
    "demo-data-factoryTemplateFileName": "demo-data-factory.json",
    "target-data-warehouseTemplateFolder": "nestedtemplates",
    "target-data-warehouseTemplateFileName": "target-data-warehouse.json"
      
  },
  "resources": [
    
    {
      "name": "demo-adls-store",
      "type": "Microsoft.Resources/deployments",
      "apiVersion": "2016-09-01",
      "dependsOn": [ ],
      "properties": {
        "mode": "Incremental",
        "templateLink": {
          "uri": "[concat(parameters('_artifactsLocation'), '/', variables('demo-adls-storeTemplateFolder'), '/', variables('demo-adls-storeTemplateFileName'), parameters('_artifactsLocationSasToken'))]",
          "contentVersion": "1.0.0.0"
        },
        "parameters": {
          "adlStoreName":  {"value": "[parameters('data-lake-account-name')]"}
        }
      }
    },
    {
      "name": "demo-data-factory",
      "type": "Microsoft.Resources/deployments",
      "apiVersion": "2016-09-01",
      "dependsOn": [
       
        "demo-adls-store",
        "target-data-warehouse"
      
      ],
      "properties": {
        "mode": "Incremental",
        "templateLink": {
          "uri": "[concat(parameters('_artifactsLocation'), '/', variables('demo-data-factoryTemplateFolder'), '/', variables('demo-data-factoryTemplateFileName'), parameters('_artifactsLocationSasToken'))]",
          "contentVersion": "1.0.0.0"
        },
        "parameters": {
          "sourceSqlServer": { "value": "[parameters('source-sql-serverName')]" },
          "dataLakeStoreAccountName": { "value": "[parameters('data-lake-account-name')]" },
          "adApplicationID": { "value": "[parameters('servicePrincipalClientID')]" },
          "adApplicationKey": { "value": "[parameters('servicePrincipalAppKey')]" },
          "adApplicationTenant": { "value": "[parameters('servicePrincipalTenant')]" },
          "targetSqlServer": { "value": "[parameters('dw-sql-serverName')]" },
          "sqlLoginName": { "value": "[parameters('sqlserver-login-name')]" },
          "sqlPassword": { "value": "[parameters('sqlserver-login-password')]" },
          "dataFactoryName": { "value": "[parameters('data-factory-name')]" },
          "pipelinePausedState": { "value": "[parameters('pipeline-paused-state')]" },
          "pipelineStartDate": { "value": "[parameters('pipeline-start-date')]" },
          "pipelineEndDate": { "value": "[parameters('pipeline-end-date')]" }
        }
      }
    },
    {
      "name": "target-data-warehouse",
      "type": "Microsoft.Resources/deployments",
      "apiVersion": "2016-09-01",
      "dependsOn": [ ],
      "properties": {
        "mode": "Incremental",
        "templateLink": {
          "uri": "[concat(parameters('_artifactsLocation'), '/', variables('target-data-warehouseTemplateFolder'), '/', variables('target-data-warehouseTemplateFileName'), parameters('_artifactsLocationSasToken'))]",
          "contentVersion": "1.0.0.0"
        },
        "parameters": {
          "target-data-warehouse-AdminLogin": { "value": "[parameters('sqlserver-login-name')]" },
          "target-data-warehouse-AdminLoginPassword": { "value": "[parameters('sqlserver-login-password')]" },
          "target-data-warehouse-server-Name": {"value":  "[parameters('dw-sql-serverName')]"}
        }
      }
    }
  ],
  "outputs": {
   
    "dwServerName": {
      "type": "string",
      "value": "[reference('target-data-warehouse').outputs.DWServerName.value]"
    },
    "dataLakeStoreName": {
      "type": "string",
      "value": "[reference('demo-adls-store').outputs.adlStoreAccount.value]"

    }
  }
}
