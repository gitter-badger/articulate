'use strict';
const Async = require('async');
const Boom = require('boom');
const AgentTools = require('../tools');
const Flat = require('flat');

module.exports = (request, reply) => {

    const agentId = request.params.id;

    let text;
    let timezone;
    let language;
    if (request.payload){
        text = request.payload.text;
        timezone = request.payload.timezone;
        language = request.payload.language;
    }
    else {
        text = request.query.text;
        timezone = request.query.timezone;
        language = request.query.language;
    }

    const server = request.server;
    const redis = server.app.redis;
    const rasa = server.app.rasa;
    const ERPipeline = server.app.rasa_er_pipeline;
    const duckling = server.app.duckling;
    let documentId;

    Async.waterfall([
        (callback) => {

            Async.parallel({
                trainedDomains: Async.apply(AgentTools.getAvailableDomains, server, redis, agentId),
                agent: (callbackGetAgent) => {

                    server.inject('/agent/' + agentId, (res) => {

                        if (res.statusCode !== 200){
                            if (res.statusCode === 404){
                                const errorNotFound = Boom.notFound('The specified agent doesn\'t exists');
                                return callbackGetAgent(errorNotFound);
                            }
                            const error = Boom.create(res.statusCode, 'An error ocurred getting the data of the agent');
                            return callbackGetAgent(error, null);
                        }
                        return callbackGetAgent(null, res.result);
                    });
                }
            }, (err, result) => {

                if (err) {
                    return callback(err, null);
                }
                return callback(null, result);
            });
        },
        (agentData, callback) => {

            const timezoneToUse = timezone ? timezone : (agentData.agent.timezone ? agentData.agent.timezone : 'America/Kentucky/Louisville');
            const languageToUse = language ? language : (agentData.agent.language ? agentData.agent.language : 'en');
            AgentTools.parseText(redis, rasa, ERPipeline, duckling, text, timezoneToUse, languageToUse, agentData, (err, result) => {

                if (err){
                    return callback(err);
                }
                return callback(null, result);
            });
        }
    ], (err, document) => {

        if (err){
            return reply(err);
        }

        Async.waterfall([
            (cb) => {

                redis.incr('documentId', (err, newDocumentId) => {

                    if (err){
                        const error = Boom.badImplementation('An error ocurred getting the new document id.');
                        return cb(error);
                    }
                    documentId = newDocumentId;
                    return cb(null);
                });
            },
            (cb) => {

                document = Object.assign({ id: documentId }, document);
                const flatDocument = Flat(document);
                redis.hmset(`document:${documentId}`, flatDocument, (err) => {

                    if (err){
                        const error = Boom.badImplementation('An error ocurred adding the document data.');
                        return cb(error);
                    }
                    return cb(null, document);
                });
            }
        ], (err, result) => {

            if (err){
                return reply(err, null);
            }
            return reply(result);
        });
    });
};
