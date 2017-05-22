{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "sourceSqlServer": { "type": "string" },
    "dataLakeStoreAccountName": { "type": "string" },
    "adApplicationID": { "type": "securestring" },
    "adApplicationKey": { "type": "securestring" },
    "adApplicationTenant": { "type": "string" },
    "targetSqlServer": { "type": "string" },
    "sqlLoginName": { "type": "string" },
    "sqlPassword": { "type": "securestring" },
    "dataFactoryName": { "type": "string" },
    "pipelinePausedState": { "type": "bool" },
    "pipelineStartDate": { "type": "string" },
    "pipelineEndDate":  {"type": "string"}

  },
  "variables": {


  },
  "resources": [
    {
      "name": "[parameters('dataFactoryName')]",
      "apiVersion": "2015-10-01",
      "type": "Microsoft.DataFactory/datafactories",
      "location": "East US",
      "resources": [
        {
          "type": "linkedservices",
          "name": "WideWorldImporters Source Database",
          "apiVersion": "2015-10-01",
          "dependsOn": [ "[parameters('dataFactoryName')]" ],
          "properties": {
            "description": "",
            "type": "AzureSqlDatabase",
            "typeProperties": {
              "connectionString": "[concat('Data Source=tcp:',parameters('sourceSqlServer'),'.database.windows.net,1433;Initial Catalog=WideWorldImporters;Integrated Security=False;User ID=',parameters('sqlLoginName'),';Password=',parameters('sqlPassword'),';Connect Timeout=30;Encrypt=True')]"
            }

          }

        },
        {
          "type": "linkedservices",
          "name": "Demo Data Lake Store",
          "apiVersion": "2015-10-01",
          "dependsOn": [ "[parameters('dataFactoryName')]" ],
          "properties": {
            "description": "",
            "type": "AzureDataLakeStore",
            "typeProperties": {
              "dataLakeStoreUri": "[concat('https://',parameters('dataLakeStoreAccountName'),'.azuredatalakestore.net/webhdfs/v1')]",
              "servicePrincipalId": "[parameters('adApplicationID')]",
              "servicePrincipalKey": "[parameters('adApplicationKey')]",
              "tenant": "[parameters('adApplicationTenant')]"
            }

          }

        },
        {
          "type": "linkedservices",
          "name": "Target SQL DW",
          "apiVersion": "2015-10-01",
          "dependsOn": [ "[parameters('dataFactoryName')]" ],
          "properties": {
            "type": "AzureSqlDW",
            "typeProperties": {
             "connectionString": "[concat('Data Source=tcp:',parameters('targetSqlServer'),'.database.windows.net,1433;Initial Catalog=wwi-sql-dw;Integrated Security=False;User ID=',parameters('sqlLoginName'),';Password=',parameters('sqlPassword'),';Connect Timeout=30;Encrypt=True')]"
            }

          }

        },
        {
          "type": "datasets",
          "name": "Dummy-SP-Output1",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "Target SQL DW"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "published": false,
            "type": "AzureSqlDWTable",
            "linkedServiceName": "Target SQL DW",
            "typeProperties": {
              "tableName": "blah.blah"
            },
            "availability": {
              "frequency": "Day",
              "interval": 1
            },

            "policy": {}
          }
        },
        {
          "type": "datasets",
          "name": "Dummy-SP-Output2",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "Target SQL DW"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "published": false,
            "type": "AzureSqlDWTable",
            "linkedServiceName": "Target SQL DW",
            "typeProperties": {
              "tableName": "blah.blah"
            },
            "availability": {
              "frequency": "Day",
              "interval": 1
            },

            "policy": {}
          }
        },
        {
          "type": "datasets",
          "name": "Sales-CustomerCategories",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "WideWorldImporters Source Database"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "published": false,
            "type": "AzureSqlTable",
            "linkedServiceName": "WideWorldImporters Source Database",
            "typeProperties": {
              "tableName": "Sales.CustomerCategories"
            },
            "availability": {
              "frequency": "Day",
              "interval": 1
            },
            "external": true,
            "policy": {}
          }
        },
        {
          "type": "datasets",
          "name": "Sales-Customers",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "WideWorldImporters Source Database"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "published": false,
            "type": "AzureSqlTable",
            "linkedServiceName": "WideWorldImporters Source Database",
            "typeProperties": {
              "tableName": "Sales.Customers"
            },
            "availability": {
              "frequency": "Day",
              "interval": 1
            },
            "external": true,
            "policy": {}
          }
        },
        {
          "type": "datasets",
          "name": "Sales-Orders",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "WideWorldImporters Source Database"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "published": false,
            "type": "AzureSqlTable",
            "linkedServiceName": "WideWorldImporters Source Database",
            "typeProperties": {
              "tableName": "Sales.Orders"
            },
            "availability": {
              "frequency": "Day",
              "interval": 1
            },
            "external": true,
            "policy": {}
          }
        },
        {
          "type": "datasets",
          "name": "Sales-Customers-ADLS",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "Demo Data Lake Store"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "published": false,
            "type": "AzureDataLakeStore",
            "linkedServiceName": "Demo Data Lake Store",
            "typeProperties": {
              "fileName": "Sales-Customers.csv",
              "folderPath": "WWI-Data/SalesData/Customer",
              "format": {
                "type": "TextFormat",
                "columnDelimiter": "|",
                "nullValue": "NULL"
              }
            },
            "availability": {
              "frequency": "Day",
              "interval": 1
            }
          }
        },
        {
          "type": "datasets",
          "name": "Sales-CustomerCategories-ADLS",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "Demo Data Lake Store"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "published": false,
            "type": "AzureDataLakeStore",
            "linkedServiceName": "Demo Data Lake Store",
            "typeProperties": {
              "fileName": "Sales-CustomerCategories.csv",
              "folderPath": "WWI-Data/SalesData/Customer",
              "format": {
                "type": "TextFormat",
                "columnDelimiter": "|",
                "nullValue": "NULL"
              }
            },
            "availability": {
              "frequency": "Day",
              "interval": 1
            }
          }
        },
        {
          "type": "datasets",
          "name": "Sales-Orders-ADLS",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "Demo Data Lake Store"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "published": false,
            "type": "AzureDataLakeStore",
            "linkedServiceName": "Demo Data Lake Store",
            "typeProperties": {
              "fileName": "Sales-Orders-{Slice}.csv",
              "folderPath": "WWI-Data/SalesData/Orders",
              "format": {
                "type": "TextFormat",
                "columnDelimiter": "|",
                "nullValue": "NULL"
              },
              "partitionedBy": [
                {
                  "name": "Slice",
                  "value": {
                    "type": "DateTime",
                    "date": "SliceStart",
                    "format": "yyyyMMddHHmm"
                  }
                }
              ]
            },
            "availability": {
              "frequency": "Day",
              "interval": 1
            }

          }
        },
        {
          "type": "dataPipelines",
          "name": "SalesDataPipeline",
          "dependsOn": [
            "[parameters('dataFactoryName')]",
            "Sales-Customers",
            "Sales-CustomerCategories",
            "Sales-Orders",
            "Sales-Customers-ADLS",
            "Sales-CustomerCategories-ADLS",
            "Sales-Orders-ADLS",
            "Target SQL DW"
          ],
          "apiVersion": "2015-10-01",
          "properties": {
            "description": "Copies Sales Data for import into DW",
            "activities": [
              {
                "type": "Copy",
                "typeProperties": {
                  "source": {
                    "type": "SqlSource",
                    "sqlReaderQuery": "SELECT [CustomerID],[CustomerName],[BillToCustomerID],[CustomerCategoryID],[BuyingGroupID],[PrimaryContactPersonID],[AlternateContactPersonID],[DeliveryMethodID],[DeliveryCityID],[PostalCityID],[CreditLimit],[AccountOpenedDate],[StandardDiscountPercentage],[IsStatementSent],[IsOnCreditHold],[PaymentDays],[PhoneNumber],[FaxNumber],[DeliveryRun],[RunPosition],[WebsiteURL],[DeliveryAddressLine1],[DeliveryAddressLine2],[DeliveryPostalCode],[PostalAddressLine1],[PostalAddressLine2],[PostalPostalCode],[LastEditedBy],[ValidFrom],[ValidTo] FROM [Sales].[Customers]"
                  },
                  "sink": {
                    "type": "AzureDataLakeStoreSink",
                    "writeBatchSize": 0,
                    "writeBatchTimeout": "00:00:00"
                  }
                },
                "inputs": [
                  {
                    "name": "Sales-Customers"
                  }
                ],
                "outputs": [
                  {
                    "name": "Sales-Customers-ADLS"
                  }
                ],
                "policy": {
                  "timeout": "1.00:00:00",
                  "concurrency": 1,
                  "retry": 3
                },
                "scheduler": {
                  "frequency": "Day",
                  "interval": 1
                },
                "name": "CopyCustomerData"
              },
              {
                "type": "Copy",
                "typeProperties": {
                  "source": {
                    "type": "SqlSource",
                    "sqlReaderQuery": "$$Text.Format('SELECT * from Sales.Orders WHERE LastEditedWhen >= \\'{0:yyyy-MM-dd HH:mm}\\' AND LastEditedWhen < \\'{1:yyyy-MM-dd HH:mm}\\'', WindowStart, WindowEnd)"
                  },
                  "sink": {
                    "type": "AzureDataLakeStoreSink",
                    "writeBatchSize": 0,
                    "writeBatchTimeout": "00:00:00"
                  }
                },
                "inputs": [
                  {
                    "name": "Sales-Orders"
                  }
                ],
                "outputs": [
                  {
                    "name": "Sales-Orders-ADLS"
                  }
                ],
                "policy": {
                  "timeout": "1.00:00:00",
                  "concurrency": 1,
                  "retry": 3
                },
                "scheduler": {
                  "frequency": "Day",
                  "interval": 1
                },
                "name": "CopyOrderData"
              },
              {
                "type": "Copy",
                "typeProperties": {
                  "source": {
                    "type": "SqlSource",
                    "sqlReaderQuery": "select * from Sales.CustomerCategories"
                  },
                  "sink": {
                    "type": "AzureDataLakeStoreSink",
                    "writeBatchSize": 0,
                    "writeBatchTimeout": "00:00:00"
                  }
                },
                "inputs": [
                  {
                    "name": "Sales-CustomerCategories"
                  }
                ],
                "outputs": [
                  {
                    "name": "Sales-CustomerCategories-ADLS"
                  }
                ],
                "policy": {
                  "timeout": "1.00:00:00",
                  "concurrency": 1,
                  "retry": 3
                },
                "scheduler": {
                  "frequency": "Day",
                  "interval": 1
                },
                "name": "CopyCustomerCategories"
              },
              {
                "name": "Customer ETL Proc",
                "type": "SqlServerStoredProcedure",
                "inputs": [
                  {
                    "name": "Sales-Customers-ADLS"
                  },
                  {
                    "name": "Sales-CustomerCategories-ADLS"
                  }
                ],
                "outputs": [
                  {
                    "name": "Dummy-SP-Output1"
                  }
                ],
                "typeProperties": {
                  "storedProcedureName": "Etl.LoadCustomerDimension",
                  "storedProcedureParameters": {}
                },
                "policy": {
                  "concurrency": 1,
                  "executionPriorityOrder": "OldestFirst",
                  "retry": 3,
                  "timeout": "01:00:00"
                },
                "scheduler": {
                  "frequency": "Day",
                  "interval": "1"
                }
              },
              {
                "name": "Order Etl Proc",
                "type": "SqlServerStoredProcedure",
                "inputs": [
                  {
                    "name": "Sales-Orders-ADLS"
                  }
                ],
                "outputs": [
                  {
                    "name": "Dummy-SP-Output2"
                  }
                ],
                "typeProperties": {
                  "storedProcedureName": "Etl.LoadOrdersFact",
                  "storedProcedureParameters": {}
                },
                "policy": {
                  "concurrency": 1,
                  "executionPriorityOrder": "OldestFirst",
                  "retry": 3,
                  "timeout": "01:00:00"
                },
                "scheduler": {
                  "frequency": "Day",
                  "interval": "1"
                }
              }
            ],
            "start": "[ parameters('pipelineStartDate') ]",
            "end": "[ parameters('pipelineEndDate') ]",
            "isPaused": "[ parameters('pipelinePausedState') ]",

            "pipelineMode": "Scheduled"
          }
        }


      ]

    }
  ],
  "outputs": {}
}