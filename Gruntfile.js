module.exports = function(grunt) {

  grunt.initConfig({
    shell: {
      'compile': {
        command: 'babel ./client/src --out-dir ./client/compiled --presets=es2015,react --source-maps inline'
      }
    },

    nodemon: {
      dev: {
        script: 'server/server.js'
      }
    },

    watch: {
      scripts: {
        files: ['client/src/**/*.jsx', 'client/src/**/*.js'],
        tasks: ['shell:compile']
      }
    },

    concurrent: {
      tasks: ['start', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    }
  });
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('compile', ['shell:compile']);
  grunt.registerTask('start', ['nodemon:dev']);
  grunt.registerTask('default', ['compile', 'concurrent']);

}