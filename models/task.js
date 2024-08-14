// server/models/Task.js
'use strict';

import { Sequelize as sequelize } from 'sequelize';
import  db from "../db/db.js";

const todo = db.define("todo", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: sequelize.STRING,
        allowNull: true
    },
    email: {
        type: sequelize.STRING,
        allowNull: true
    },
    taskName: {
        type: sequelize.STRING,
        allowNull: true
    },
    description: {
        type: sequelize.STRING,
        allowNull: true
    },
    dueDate: {
        type: sequelize.DATE,
        allowNull: true
    },
    status: {
        type: sequelize.ENUM('pending', 'inProgress', 'completed'),
        validate: {
            isValidValue: function(value) {
                if (value != 'pending' && value != 'inProgress' && value != 'completed')
                    throw new Error("Invalid Type");
            }
        }
    },
}, {
    timestamps: false,
    tableName: 'todo',
    modelName: 'todo' // Explicitly specify the model name
});
export default todo;
