/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from 'chai';
import JDLRelationship from '../models/jdl-relationship.js';
import RelationshipValidator from '../validators/relationship-validator.js';
import { relationshipOptions, relationshipTypes } from '../jhipster/index.mjs';

const { BUILT_IN_ENTITY } = relationshipOptions;
const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = relationshipTypes;

describe('jdl - RelationshipValidator', () => {
  let validator;

  before(() => {
    validator = new RelationshipValidator();
  });

  describe('validate', () => {
    context('when not passing anything', () => {
      it('should fail', () => {
        expect(() => validator.validate()).to.throw(/^No relationship\.$/);
      });
    });
    context('when passing a relationship', () => {
      context('with all its required attributes', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: ONE_TO_ONE,
            injectedFieldInTo: 'a',
            injectedFieldInFrom: 'b',
          });
        });

        it('should not fail', () => {
          expect(() => validator.validate(relationship)).not.to.throw();
        });
      });
      context('with an invalid type', () => {
        let relationship;

        before(() => {
          relationship = {
            from: 'A',
            to: 'B',
            type: 'toto',
            injectedFieldInTo: 'a',
          };
        });

        it('should fail', () => {
          expect(() => validator.validate(relationship)).to.throw(/^The relationship type 'toto' doesn't exist\.$/);
        });
      });
      context('without any injected field', () => {
        let relationship;

        before(() => {
          relationship = {
            from: 'A',
            to: 'B',
            type: ONE_TO_ONE,
          };
        });

        it('should fail', () => {
          expect(() => validator.validate(relationship)).to.throw(/^At least one injected field is required\.$/);
        });
      });
      context(`when using the ${BUILT_IN_ENTITY} option`, () => {
        context(`in a ${ONE_TO_ONE} relationship`, () => {
          let relationship;

          before(() => {
            relationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
              options: { [BUILT_IN_ENTITY]: true },
            });
          });

          it('should not fail', () => {
            expect(() => validator.validate(relationship)).not.to.throw();
          });
        });
        [ONE_TO_MANY, MANY_TO_MANY, MANY_TO_ONE].forEach(type => {
          context(`in a ${type} relationship`, () => {
            let relationship;

            before(() => {
              relationship = new JDLRelationship({
                from: 'A',
                to: 'B',
                type,
                injectedFieldInTo: 'a',
                options: {
                  global: {
                    [BUILT_IN_ENTITY]: true,
                  },
                },
              });
            });

            it('should not fail', () => {
              expect(() => validator.validate(relationship)).not.to.throw();
            });
          });
        });
      });
      context('when having a reflexive relationship', () => {
        context('with both sides being required', () => {
          let relationship;

          before(() => {
            relationship = {
              from: 'A',
              to: 'A',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'aa',
              isInjectedFieldInFromRequired: true,
            };
          });

          it('should fail', () => {
            expect(() => validator.validate(relationship)).to.throw(
              /^Required relationships to the same entity are not supported, for relationship from and to 'A'\.$/,
            );
          });
        });
      });
      context(`when having a ${ONE_TO_ONE} relationship`, () => {
        context('without an injected field in the source entity', () => {
          let relationship;

          before(() => {
            relationship = {
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
            };
          });

          it('should fail', () => {
            expect(() => validator.validate(relationship)).to.throw(
              /^In the One-to-One relationship from A to B, the source entity must possess the destination, or you must invert the direction of the relationship\.$/,
            );
          });
        });
      });
      context(`when having a ${MANY_TO_ONE} relationship`, () => {
        context('when having a bidirectional relationship', () => {
          let relationship;

          before(() => {
            relationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_ONE,
              injectedFieldInFrom: 'b',
              injectedFieldInTo: 'a',
            });
          });

          it('should not fail', () => {
            expect(() => validator.validate(relationship)).not.to.throw();
          });
        });
      });
      context(`when having a ${MANY_TO_MANY} relationship`, () => {
        context('when not having an bidirectional relationship', () => {
          let relationship1;
          let relationship2;

          before(() => {
            relationship1 = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInTo: 'a',
            });
            relationship2 = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInFrom: 'b',
            });
          });
        });
      });
      context('with the user entity', () => {
        context(`when having a ${ONE_TO_ONE} relationship`, () => {
          context('having an injected field in the source entity', () => {
            let relationship;

            before(() => {
              relationship = {
                from: 'A',
                to: 'User',
                type: ONE_TO_ONE,
                injectedFieldInFrom: 'user',
              };
            });

            it('should not fail', () => {
              expect(() => validator.validate(relationship)).not.to.throw();
            });
          });
        });
        context(`when having a ${MANY_TO_ONE} relationship`, () => {
          context('without the User having the injected field', () => {
            let relationship;

            before(() => {
              relationship = new JDLRelationship({
                from: 'A',
                to: 'User',
                type: MANY_TO_ONE,
                injectedFieldInFrom: 'user',
              });
            });

            it('should not fail', () => {
              expect(() => validator.validate(relationship)).not.to.throw();
            });
          });
          context('with the User having the injected field', () => {
            context('as the source', () => {
              let relationship;

              before(() => {
                relationship = new JDLRelationship({
                  from: 'User',
                  to: 'A',
                  type: MANY_TO_ONE,
                  injectedFieldInFrom: 'a',
                });
              });

              it('should not fail', () => {
                expect(() => validator.validate(relationship)).not.to.throw();
              });
            });
            context('as the destination', () => {
              let relationship;

              before(() => {
                relationship = new JDLRelationship({
                  from: 'A',
                  to: 'User',
                  type: MANY_TO_ONE,
                  injectedFieldInTo: 'a',
                });
              });

              it('should fail', () => {
                expect(() => validator.validate(relationship)).not.to.throw();
              });
            });
          });
        });
        context(`when having a ${MANY_TO_MANY} relationship`, () => {
          context('with the user being the destination', () => {
            let relationship;

            before(() => {
              relationship = new JDLRelationship({
                from: 'A',
                to: 'User',
                type: MANY_TO_MANY,
                injectedFieldInFrom: 'user',
              });
            });

            it('should not fail', () => {
              expect(() => validator.validate(relationship)).not.to.throw();
            });
          });
          context('with the user being the source', () => {
            let relationship;

            before(() => {
              relationship = new JDLRelationship({
                from: 'User',
                to: 'A',
                type: MANY_TO_MANY,
                injectedFieldInTo: 'a',
              });
            });

            it('should fail', () => {
              expect(() => validator.validate(relationship)).not.to.throw();
            });
          });
        });
      });
    });
  });
});
