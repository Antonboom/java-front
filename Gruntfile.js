module.exports = function (grunt) {

    grunt.initConfig({
        
        // запуск сервера через скрипт shell'a https://www.npmjs.com/package/grunt-shell
        shell: {
            options: {
                stdout: true,
                stderr: true
            },
            server: {
                //command: 'node server.js'
		command: 'java -cp target/L1.3-2.0.jar main.Main 8090'
            }
		},

		watch: {
            // запуск watcher'a, который следит за изенениями файлов  templates/*.xml
            // и если они изменяются, то запускает таск сборки шаблонов (grunt fest)
            fest: {
                files: ['templates/*.xml'],
                tasks: ['fest'],
                options: {
                    spawn: 'false',     // false
                    atBegin: 'true',    // true
                },
            }
		},

        qunit: {
            all: ['./public_html/tests/index.html']
        },

		concurrent: {
			dev: ['shell', 'watch'],
            options: {
                logConcurrentOutput: true
            }
		},

		fest: {
            templates: {
                files: [{
                    expand: true,
                    cwd: 'templates',
                    src: '*.xml',
                    dest: 'public_html/js/tmpl'
                }],
                options: {
                    template: function (data) {
                        return grunt.template.process(
                            'define(function () { return <%= contents %> ; });',
                            {data: data}
                        );
                    }
                }
            }
        }

    });

	// подключть все необходимые модули
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-concurrent');
  	grunt.loadNpmTasks('grunt-shell');
  	grunt.loadNpmTasks('grunt-fest');

    // результат команды grunt
    grunt.registerTask('default', ['concurrent']);
    grunt.registerTask('test', ['qunit:all']);
};
