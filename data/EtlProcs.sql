GRANT EXECUTE ON SCHEMA::Etl to LoadUser;

IF EXISTS (SELECT * FROM sys.procedures where name = 'LoadCustomerDimension' and schema_id = schema_id('Etl'))
	DROP PROCEDURE Etl.LoadCustomerDimension
GO


CREATE PROCEDURE Etl.LoadCustomerDimension AS
BEGIN



IF NOT EXISTS (SELECT * FROM sys.external_tables WHERE name = 'CustomerCategory' AND schema_id = schema_id('Ext'))

BEGIN
CREATE EXTERNAL TABLE Ext.CustomerCategory(
customerCategoryID INT,
custcategory nvarchar(100),
lastEditedBy INT,
ValidFrom DateTime2,
ValidTo DateTime2

)
WITH 
(
LOCATION = '/WWI-Data/SalesData/Customer/Sales-CustomerCategories.csv',
DATA_SOURCE = arapaima_adls,
FILE_FORMAT = wwi_csv )

END

IF NOT EXISTS (SELECT * FROM sys.external_tables where name = 'Customer' and schema_id = schema_id('Ext'))
BEGIN
CREATE EXTERNAL TABLE Ext.Customer(
CustomerID INT,
CustomerName nvarchar(100),
BillToCustomerID int,
CustomerCategoryID int,
BuyingGroupID int,
PrimaryContactPersonID int,
AlternateContactPersonID int,
DeliveryMethodID int,
DeliveryCityID int,
PostalCityID int,
CreditLimit decimal (18, 3),
AccountOpenedDate date,
StandardDiscountPercentage decimal(18, 3),
IsStatementSent bit,
IsOnCreditHold bit,
PaymentDays int,
PhoneNumber nvarchar(40),
FaxNumber nvarchar(40),
DeliveryRun nvarchar(10),
RunPosition nvarchar(10),
WebsiteURL nvarchar(255),
DeliveryAddressLine1 nvarchar(120),
DeliveryAddressLine2 nvarchar(120),
DeliveryPostalCode nvarchar(10),
PostalAddressLine1 nvarchar(120),
PostalAddressLine2 nvarchar(120),
PostalPostalCode nvarchar(10),
LastEditedBy int,
ValidFrom DateTime2,
ValidTo DateTime2
)
WITH 
(
LOCATION = '/WWI-Data/SalesData/Customer/Sales-Customers.csv',
DATA_SOURCE = arapaima_adls,
FILE_FORMAT = wwi_csv )

END
 
IF EXISTS (SELECT * FROM sys.tables where name = 'CustomerNew' and schema_id = schema_id('Dim'))
	DROP TABLE Dim.CustomerNew;

CREATE TABLE Dim.CustomerNew
WITH (DISTRIBUTION = ROUND_ROBIN)
AS
SELECT CustomerID, custcategory as CustomerCategory
FROM Ext.Customer AS EC INNER JOIN Ext.CustomerCategory AS ECC
ON EC.CustomerCategoryID = ECC.CustomerCategoryID

IF EXISTS (SELECT * FROM sys.tables where name = 'CustomerOld' and schema_id = schema_id('Dim'))
	DROP TABLE Dim.CustomerOld;

IF EXISTS (SELECT * FROM sys.tables where name = 'Customer' and schema_id = schema_id('Dim'))
	RENAME OBJECT Dim.Customer TO CustomerOld;

RENAME OBJECT Dim.CustomerNew TO Customer;

IF EXISTS (SELECT * FROM sys.tables where name = 'CustomerOld' and schema_id = schema_id('Dim'))
	DROP TABLE Dim.CustomerOld;

END
GO


IF EXISTS (SELECT * FROM sys.procedures where name = 'LoadOrdersFact' and schema_id = schema_id('Etl'))
	DROP PROCEDURE Etl.LoadOrdersFact
GO

CREATE PROCEDURE Etl.LoadOrdersFact AS
BEGIN

 
IF NOT EXISTS (SELECT * from sys.external_tables where name = 'Orders' and schema_id = schema_id('Ext'))
BEGIN
CREATE EXTERNAL TABLE Ext.Orders
(
OrderID int ,
	CustomerID int ,
	SalespersonPersonID int ,
	PickedByPersonID int ,
	ContactPersonID int ,
	BackorderOrderID int ,
	OrderDate datetime2(7) ,
	ExpectedDeliveryDate date ,
	CustomerPurchaseOrderNumber nvarchar(20) ,
	IsUndersupplyBackordered bit ,
	Comments nvarchar(4000) ,
	DeliveryInstructions nvarchar(4000) ,
	InternalComments nvarchar(4000) ,
	PickingCompletedWhen datetime2(7) ,
	LastEditedBy int ,
	LastEditedWhen datetime2(7) 

)
WITH
(
LOCATION = '/WWI-Data/SalesData/Orders/',
DATA_SOURCE = arapaima_adls,
FILE_FORMAT = wwi_csv )

END

IF EXISTS (SELECT * FROM sys.tables where name = 'OrdersNew' and schema_id = schema_id('Fact'))
	DROP TABLE Fact.OrdersNew;

CREATE TABLE  Fact.OrdersNew
WITH (DISTRIBUTION = ROUND_ROBIN)
AS
SELECT OrderID, CustomerID, CAST(CONVERT(CHAR(8), OrderDate, 112) AS INT) as OrderDateKey
from Ext.Orders

IF EXISTS (SELECT * FROM sys.tables where name = 'OrdersOld' and schema_id = schema_id('Fact'))
	DROP TABLE  Fact.OrdersOld;

IF EXISTS (SELECT * FROM sys.tables where name = 'Orders' and schema_id = schema_id('Fact'))
	RENAME OBJECT Fact.Orders TO OrdersOld;

RENAME OBJECT Fact.OrdersNew TO Orders;

IF EXISTS (SELECT * FROM sys.tables where name = 'OrdersOld' and schema_id = schema_id('Fact'))
	DROP TABLE  Fact.OrdersOld;

END
GO

