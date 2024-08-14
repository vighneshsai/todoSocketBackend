import todoDbModal from "../models/task.js"
import { Op, Sequelize } from "sequelize";
import  db from "../db/db.js";
import { faker } from '@faker-js/faker';
import io from '../webSocket.js'; 
import nodemailer from "nodemailer"

const GET_TASKS = " SELECT id, name, email, taskName, description, dueDate, status " +
    "FROM todo WHERE 1 = 1 " 
  
const GET_TASK_COUNT = "SELECT COUNT(*) as count " +
    "FROM todo WHERE 1 = 1 "    

const GET_TASK_SEARCH = "AND taskName LIKE CONCAT('%', :searchString, '%') OR name LIKE CONCAT('%', :searchString, '%') OR description LIKE CONCAT('%', :searchString, '%')OR status LIKE CONCAT('%', :searchString, '%') "
const randomName = faker.name.fullName(); // Instead of faker.name.findName()

// Generate a random first name
const randomFirstName = faker.name.firstName();

// Generate a random last name
const randomLastName = faker.name.lastName();
const randomStatus = faker.helpers.arrayElement(['Pending', 'In Progress', 'Completed']);


export const addTaskData = async (req, res) => {
    const { name, taskName, description, dueDate, status } = req.body
    const task = { name, taskName, description, dueDate, status };

    return todoDbModal.create(task)
        .then((newTask) => {
            res.status(201).send("Task created successFully");
            
        })
        .catch((err) => {
            res.status(500).send(err);
        });
    
}

export const getTasks = async (req, res) => {
    const { page, limit, search, sort, order } = req.query;
    console.log(page, limit, search, sort, order)
    let queryReplacements = {
        searchString : search
    }
    let getTaskQuery = GET_TASKS
    let getTaskCount = GET_TASK_COUNT
      
        if (search) {
            getTaskQuery += GET_TASK_SEARCH
            getTaskCount += GET_TASK_SEARCH
        }
        if (sort, order) {
            getTaskQuery += `ORDER BY ${sort} ${order} `
        }
            getTaskQuery += `LIMIT ${limit ? limit : 10} OFFSET 0`
    try {
        db.query(getTaskQuery, {
            type: db.QueryTypes.SELECT,
            replacements: queryReplacements
        }).then((tasks) => {
            db.query(getTaskCount, {
                type: db.QueryTypes.SELECT,
                replacements: queryReplacements
            }).then((count)=> {
                var totalCount = count[0].count
                var totalPages = Math.ceil(totalCount/ limit)
                res
                .status(200)
                .json({ tasks, totalPages  });
            })
           
        }).catch((error)=> {
            res.status(500).send({error: error.message})
        })

        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const updateTasks = async (req, res) => {
    const { id } = req.query;
    const { name, taskName, description, dueDate, status } = req.body;
    try {
        const task = await todoDbModal.findByPk(id); // Find task by primary key

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update task with new values
        task.name = name || task.name;
        task.taskName = taskName || task.taskName;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.status = status || task.status;

        // Save the updated task to the database
        await task.save();
        res.json(task);
        
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const deleteTasks = async (req, res) => {
    const { id } = req.query;

    try {
        const task = await todoDbModal.findByPk(id); // Find task by primary key

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.destroy(); // Delete the task

        res.json({ message: 'Task deleted successfully' });
       
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


export const seedDatabase = async(req, res) => {
    const records = [];
    for (let i = 0; i < 100000; i++) {

    records.push({
        name: faker.name.fullName(),           // Generate a random full name
        email: faker.internet.email(),         // Generate a random email address
        taskName: faker.lorem.sentence(),      // Generate a random task name
        description: faker.lorem.paragraph(),  // Generate a random description
        dueDate: faker.date.future(),          // Generate a random future date
        status: faker.helpers.arrayElement(['pending', 'inProgress', 'completed']), // Random status
      });
        }
     if (records.length == 100000) {

        await todoDbModal.bulkCreate(records).then(()=> {
            res.status(200).send("Tasks created successfully")
        });
      }
  console.log('Database seeded!');
}

// Function to send WebSocket notification
function sendWebSocketNotification(todo) {
    io.on('connection', (socket) => {
        console.log('Socket client connected');
    
        socket.on('message', (message) => {
            console.log(`Received: ${message}`);
        });
    
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    
        socket.emit('message', `Your todo "${todo?.taskName}" is due now!`);
    });
}

// Function to send email notification
function sendEmailNotification(todo) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'vighneshsai23@gmail.com',
            pass: 'vighnesh@2000',
        },
    });
    console.log(transporter)
    const mailOptions = {
        from: 'vighneshsai23@gmail.com',
        to: todo.email,  // This could be dynamic based on the user's email
        subject: 'Todo Alert',
        text: `Your todo "${todo.taskName}" is due now!`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Function to check for due todos and send notifications
export const checkDueTodos = async(io) => {
    var now = new Date();
    now.setUTCHours(0, 0, 0, 0)

    const dueTodos = await todoDbModal.findAll({
        where: {
            dueDate: {
                [Sequelize.Op.lte]: now,
            },
        },
    });

    dueTodos.forEach(todo => {
        sendWebSocketNotification(todo, io);
        sendEmailNotification(todo);
    });
}

