BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000),
    [emailVerified] DATETIME2,
    [image] NVARCHAR(1000),
    [bio] NVARCHAR(1000),
    [employmentMode] NVARCHAR(1000) NOT NULL CONSTRAINT [User_employmentMode_df] DEFAULT 'full-time',
    [income] FLOAT(53) NOT NULL CONSTRAINT [User_income_df] DEFAULT 0,
    [incomeFrequency] NVARCHAR(1000) NOT NULL CONSTRAINT [User_incomeFrequency_df] DEFAULT 'monthly',
    [level] INT NOT NULL CONSTRAINT [User_level_df] DEFAULT 1,
    [experience] INT NOT NULL CONSTRAINT [User_experience_df] DEFAULT 0,
    [healthScore] INT NOT NULL CONSTRAINT [User_healthScore_df] DEFAULT 50,
    [streak] INT NOT NULL CONSTRAINT [User_streak_df] DEFAULT 0,
    [lastActive] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Account] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [refresh_token] NVARCHAR(1000),
    [access_token] NVARCHAR(1000),
    [expires_at] INT,
    [token_type] NVARCHAR(1000),
    [scope] NVARCHAR(1000),
    [id_token] NVARCHAR(1000),
    [session_state] NVARCHAR(1000),
    CONSTRAINT [Account_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Account_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] NVARCHAR(1000) NOT NULL,
    [sessionToken] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Session_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[Budget] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Budget_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Budget_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Expense] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [frequency] NVARCHAR(1000) NOT NULL CONSTRAINT [Expense_frequency_df] DEFAULT 'monthly',
    [description] NVARCHAR(1000),
    [date] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Expense_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Expense_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Income] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [source] NVARCHAR(1000) NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [frequency] NVARCHAR(1000) NOT NULL CONSTRAINT [Income_frequency_df] DEFAULT 'monthly',
    [description] NVARCHAR(1000),
    [date] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Income_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Income_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Goal] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [targetAmount] FLOAT(53) NOT NULL,
    [currentAmount] FLOAT(53) NOT NULL CONSTRAINT [Goal_currentAmount_df] DEFAULT 0,
    [deadline] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Goal_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Goal_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Achievement] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [icon] NVARCHAR(1000),
    [earnedAt] DATETIME2 NOT NULL CONSTRAINT [Achievement_earnedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Achievement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Bill] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [dueDate] DATETIME2 NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [frequency] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [reminderDays] INT NOT NULL CONSTRAINT [Bill_reminderDays_df] DEFAULT 3,
    [autoPay] BIT NOT NULL CONSTRAINT [Bill_autoPay_df] DEFAULT 0,
    [paymentURL] NVARCHAR(1000),
    [lastPaid] DATETIME2,
    [isPaid] BIT NOT NULL CONSTRAINT [Bill_isPaid_df] DEFAULT 0,
    [isRecurring] BIT NOT NULL CONSTRAINT [Bill_isRecurring_df] DEFAULT 1,
    [nextDueDate] DATETIME2,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Bill_status_df] DEFAULT 'upcoming',
    [isPinned] BIT NOT NULL CONSTRAINT [Bill_isPinned_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Bill_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Bill_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[BillPayment] (
    [id] NVARCHAR(1000) NOT NULL,
    [billId] NVARCHAR(1000) NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [paymentDate] DATETIME2 NOT NULL,
    [notes] NVARCHAR(1000),
    [method] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [BillPayment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [BillPayment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Budget] ADD CONSTRAINT [Budget_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Expense] ADD CONSTRAINT [Expense_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Income] ADD CONSTRAINT [Income_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Goal] ADD CONSTRAINT [Goal_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Achievement] ADD CONSTRAINT [Achievement_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Bill] ADD CONSTRAINT [Bill_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[BillPayment] ADD CONSTRAINT [BillPayment_billId_fkey] FOREIGN KEY ([billId]) REFERENCES [dbo].[Bill]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
