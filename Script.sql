
create database Car_Manager;

Go

Use Car_Manager;

Go

-- Tk admin fix cứng trong code

CREATE TABLE [user] (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    point INT NOT NULL DEFAULT 0
);

CREATE TABLE [transaction] (
    id INT PRIMARY KEY IDENTITY(1,1),
    propose_username NVARCHAR(100) NOT NULL,
    receive_username NVARCHAR(100) NOT NULL,
    point DECIMAL(10, 2) NOT NULL,
    date_time DATETIME NOT NULL DEFAULT GETDATE(),
    calendar1 NVARCHAR(500),
    calendar2 NVARCHAR(500)
);

select * from [transaction];

