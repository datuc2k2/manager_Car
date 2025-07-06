
create database Car_Manager;

Go

Use Car_Manager;

Go

-- Tk admin fix cứng trong code

CREATE TABLE [user] (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    point DECIMAL(10, 2) NOT NULL DEFAULT 0
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

select * from [user]; --duc 3

2.00
-2.00
1.00
-1.00
1.00
-1.00
0.00
0.00
0.00
0.00

update [user] set point = 0;

delete from [transaction];

INSERT INTO [user] (name)
VALUES 
(N'Cường Coca san'),
(N'Gọi Xe Là Có'),
(N'Đức'),
(N'Nguyendam'),
(N'An Đông'),
(N'Hải Đăng Travel'),
(N'Thu Hoàng'),
(N'Phương Thành Phát'),
(N'Mr Long'),
(N'Tran Cuong');


